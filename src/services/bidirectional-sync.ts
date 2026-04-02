/**
 * Bidirectional Sync Manager
 * Coordinates synchronization between Hue and Loxone.
 * Loop prevention is delegated to SyncLoopGuard.
 */

import Config from '../config';
import Logger from '../utils/logger';
import { IHueClient } from '../types/services';
import { ILoxoneClient } from '../types/services';
import LoxoneUDP from './loxone-udp';
import { DeviceMapping, LoxoneControlRaw } from '../types';
import { LightConverterFactory } from '../utils/light-converters';
import { xyToLoxoneHsv, mirekToLoxoneTemp, hueBrightnessToLoxoneDimmer } from '../utils/color';
import CONSTANTS from '../constants';
import { SyncLoopGuard } from './sync-loop-guard';

interface SyncStats {
  hueToLoxone: number;
  loxoneToHue: number;
}

/**
 * Loxone control information
 */
interface ControlInfo {
  controlName: string;
  stateName: string;
  controlType: string;
  details?: Record<string, any>;  // Control details (e.g., pickerType for ColorPickerV2)
}

/**
 * Loxone value state update
 */
interface LoxoneUpdate {
  uuid: string;
  value: number;
  control: ControlInfo;
}

/**
 * Hue event data
 */
interface HueEventData {
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
  };
  color_temperature?: {
    mirek: number;
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
  };
}

class BidirectionalSyncManager {
  private config: Config;
  private logger: Logger;
  private hueClient: IHueClient;
  private loxoneClient: ILoxoneClient;
  private loopGuard: SyncLoopGuard;
  private stats: SyncStats;

  constructor(
    config: Config,
    logger: Logger,
    hueClient: IHueClient,
    loxoneClient: ILoxoneClient,
    _loxoneUdp: LoxoneUDP
  ) {
    this.config = config;
    this.logger = logger;
    this.hueClient = hueClient;
    this.loxoneClient = loxoneClient;

    const debounceMs = this.config.get('bidirectionalDebounceMs') || CONSTANTS.SYNC.DEBOUNCE_MS;
    this.loopGuard = new SyncLoopGuard(
      logger,
      debounceMs,
      CONSTANTS.SYNC.MOOD_DEBOUNCE_MS,
      CONSTANTS.SYNC.CLEANUP_INTERVAL_MS
    );

    this.stats = {
      hueToLoxone: 0,
      loxoneToHue: 0
    };
  }

  /**
   * Start the sync manager
   */
  start(): void {
    this.logger.info('Starting BidirectionalSyncManager...', 'SYNC');

    // Listen to Loxone value state updates
    this.loxoneClient.on('value_states', (updates: LoxoneUpdate[]) => {
      this._handleLoxoneUpdates(updates);
    });

    // Listen to Loxone text state updates (for mood detection)
    this.loxoneClient.on('text_states', (updates: any[]) => {
      this._handleTextStates(updates);
    });

    this.loopGuard.start();

    this.logger.success('BidirectionalSyncManager started', 'SYNC');
  }

  /**
   * Stop the sync manager
   */
  stop(): void {
    this.logger.info('Stopping BidirectionalSyncManager...', 'SYNC');

    // Remove event listeners
    this.loxoneClient.removeAllListeners('value_states');
    this.loxoneClient.removeAllListeners('text_states');

    this.loopGuard.stop();

    this.logger.success('BidirectionalSyncManager stopped', 'SYNC');
  }

  /**
   * Find mapping by Hue UUID
   */
  private _findMappingByHueUuid(hueUuid: string): DeviceMapping | null {
    const mapping = this.config.getMapping();
    return mapping.find(m => m.hue_uuid === hueUuid) || null;
  }

  /**
   * Find mapping by Loxone state UUID
   */
  private _findMappingByLoxoneStateUuid(loxoneStateUuid: string): DeviceMapping | null {
    const mapping = this.config.getMapping();
    return mapping.find(m => {
      // Check if this state UUID matches any of the configured state UUIDs
      return m.loxone_state_uuid === loxoneStateUuid ||
             m.loxone_dimmer_uuid === loxoneStateUuid;
    }) || null;
  }

  /**
   * Handle Loxone value state updates
   */
  private async _handleLoxoneUpdates(updates: LoxoneUpdate[]): Promise<void> {
    if (!this.config.get('syncEnabled')) {
      return;
    }

    for (const update of updates) {
      try {
        await this._processLoxoneUpdate(update);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to process Loxone update: ${message}`, 'SYNC');
      }
    }
  }

  /**
   * Handle Loxone text state updates (for mood detection and ColorPickerV2 color states)
   */
  private async _handleTextStates(updates: any[]): Promise<void> {
    if (!this.config.get('syncEnabled')) {
      return;
    }

    for (const update of updates) {
      try {
        const { uuid, text } = update;

        // Check if this is an activeMoods state (text format: "[moodId1,moodId2,...]")
        if (text && text.startsWith('[') && text.endsWith(']')) {
          this._handleMoodChange(text);
          continue;
        }

        // Check if this is a ColorPickerV2 color state
        // Color states have format: "hsv(h,s,v)" or "temp(v,k)"
        if (text && (text.startsWith('hsv(') || text.startsWith('temp('))) {
          await this._handleColorStateUpdate(uuid, text);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to process text state: ${message}`, 'SYNC');
      }
    }
  }

  /**
   * Handle ColorPickerV2 color state update
   */
  private async _handleColorStateUpdate(stateUuid: string, colorValue: string): Promise<void> {
    // Get control info for this state UUID
    const controlInfo = this.loxoneClient.getControlByStateUuid(stateUuid);

    if (!controlInfo) {
      return; // Unknown state UUID
    }

    if (controlInfo.controlType !== 'ColorPickerV2' || controlInfo.stateName !== 'color') {
      return; // Not a ColorPickerV2 color state
    }

    // Find mapping by control UUID (need to extract control UUID from state)
    // The control UUID is typically the base of the state UUID or the parent control
    const mapping = this._findMappingByColorStateUuid(stateUuid);

    if (!mapping) {
      return; // No mapping for this control
    }

    if (!mapping.bidirectional) {
      return; // Bidirectional sync not enabled
    }

    // Check if this is an echo of our own change
    if (this.loopGuard.isEcho(mapping.hue_uuid, 'hue')) {
      return; // Ignore echo
    }

    this.logger.debug(
      `Loxone color update: ${controlInfo.controlName} = ${colorValue}`,
      'SYNC'
    );

    // Mark change source as Loxone
    this.loopGuard.mark(mapping.hue_uuid, 'loxone');

    // Update Hue device
    await this._updateHueFromLoxone(mapping, controlInfo, colorValue);

    this.stats.loxoneToHue++;
  }

  /**
   * Find mapping by color state UUID
   * For ColorPickerV2, the color state UUID is different from the position/dimmer UUID
   */
  private _findMappingByColorStateUuid(colorStateUuid: string): DeviceMapping | null {
    const mapping = this.config.getMapping();

    // Try to find by matching the base UUID pattern
    // ColorPickerV2 controls have multiple state UUIDs that share a common base
    for (const m of mapping) {
      if (!m.loxone_state_uuid) continue;

      // Extract base UUID (first part before potential variation)
      // Example: 1eae8ee1-00cb-786e-ffffa8882f92d577 vs 1eae8ee1-00cb-786f-2fffa8882f92d577
      // They share the same base pattern, differing only in minor digits
      const basePattern = m.loxone_state_uuid.substring(0, 20); // First 20 chars
      const colorPattern = colorStateUuid.substring(0, 20);

      if (basePattern === colorPattern) {
        return m;
      }
    }

    return null;
  }

  /**
   * Handle mood change detection
   */
  private _handleMoodChange(moodText: string): void {
    try {
      // Parse mood IDs from text like "[778,779]" or "[]" or "[778]"
      const moodIds = JSON.parse(moodText);

      if (!Array.isArray(moodIds)) {
        return;
      }

      // Check if this is "Aus" mood: either empty array [] or single mood AUS_MOOD_ID
      const isAusMood = moodIds.length === 0 || (moodIds.length === 1 && moodIds[0] === CONSTANTS.SYNC.AUS_MOOD_ID);

      const moodDescription = moodIds.length > 0
        ? moodIds.join(', ') + ' active'
        : '"Aus" (all off)';

      this.logger.info(`Mood change detected: ${moodDescription}`, 'SYNC');

      // Skip extended debounce for "Aus" mood
      // "Aus" just turns lights off - no color changes that could cause sync loops
      // Users often turn lights back on immediately, so we want sync to work normally
      if (isAusMood) {
        this.logger.debug('Skipping extended debounce for "Aus" mood (no sync blocking needed)', 'SYNC');
        return;
      }

      // Apply extended debounce for active moods to prevent Hue→Loxone sync loops
      // This prevents the mood from being deactivated when lights change
      const mappings = this.config.getMapping();
      const bidirectionalMappings = mappings.filter(m => m.bidirectional);

      bidirectionalMappings.forEach(mapping => {
        this.loopGuard.mark(mapping.hue_uuid, 'loxone', true);
      });

      this.logger.debug(
        `Extended debounce applied to ${bidirectionalMappings.length} devices for ${this.moodDebounceWindow}ms`,
        'SYNC'
      );
    } catch (error) {
      // Silently ignore parse errors - might not be a mood state
    }
  }

  /**
   * Process a single Loxone update
   */
  private async _processLoxoneUpdate(update: LoxoneUpdate): Promise<void> {
    const { uuid, value, control } = update;

    // Find mapping for this state UUID
    const mapping = this._findMappingByLoxoneStateUuid(uuid);

    if (!mapping) {
      // No mapping for this state, ignore
      return;
    }

    if (!mapping.bidirectional) {
      // Bidirectional sync not enabled for this device
      return;
    }

    // Check if this is an echo of our own change
    if (this.loopGuard.isEcho(mapping.hue_uuid, 'hue')) {
      return; // Ignore echo
    }

    this.logger.debug(
      `Loxone update: ${control.controlName} (${control.stateName}) = ${value}`,
      'SYNC'
    );

    // Mark change source as Loxone
    this.loopGuard.mark(mapping.hue_uuid, 'loxone');

    // Update Hue device
    await this._updateHueFromLoxone(mapping, control, value);

    this.stats.loxoneToHue++;
  }

  /**
   * Update Hue device from Loxone state change
   */
  private async _updateHueFromLoxone(
    mapping: DeviceMapping,
    control: ControlInfo,
    value: number | string  // Accept both numeric and string formats
  ): Promise<void> {
    try {
      // Filter by state name (only sync relevant states)
      if (control.controlType === 'Dimmer' && control.stateName !== 'position') {
        // Ignore min/max/step states for Dimmer
        return;
      }

      if (control.controlType === 'ColorPickerV2' && control.stateName !== 'color') {
        // Only sync color state for ColorPickerV2
        return;
      }

      // Build light context
      const capabilities = this.hueClient.getLightCapabilities()[mapping.hue_uuid];
      const context = LightConverterFactory.createContext(
        control.controlType,
        control.details,
        capabilities,
        mapping.hue_uuid
      );

      // Get converter and convert Loxone value to Hue payload
      const converter = LightConverterFactory.getLoxoneToHueConverter(context);
      const payload = converter(value);

      // Determine resource type
      const resourceType = mapping.hue_type === 'group' ? 'grouped_light' : 'light';

      // Send to Hue
      this.logger.debug(`Updating Hue ${mapping.hue_name}: ${JSON.stringify(payload)}`, 'SYNC');
      await this.hueClient.updateLight(mapping.hue_uuid, resourceType, payload, mapping.loxone_name);

      this.logger.success(
        `Synced ${control.controlName} → ${mapping.hue_name}`,
        'SYNC'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update Hue from Loxone: ${message}`);
    }
  }

  /**
   * Handle Hue device change (called from EventStream)
   */
  async onHueChange(hueUuid: string, data: HueEventData): Promise<void> {
    try {
      // Find mapping
      const mapping = this._findMappingByHueUuid(hueUuid);

      if (!mapping) {
        return; // No mapping
      }

      if (!mapping.bidirectional) {
        return; // Bidirectional sync not enabled
      }

      // Check if this is an echo of our own change
      if (this.loopGuard.isEcho(hueUuid, 'loxone')) {
        return; // Ignore echo
      }

      this.logger.debug(`Hue change: ${mapping.hue_name}`, 'SYNC');

      // Mark change source as Hue
      this.loopGuard.mark(hueUuid, 'hue');

      // Update Loxone
      await this._updateLoxoneFromHue(mapping, data);

      this.stats.hueToLoxone++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process Hue change: ${message}`, 'SYNC');
    }
  }

  /**
   * Update Loxone from Hue state change
   */
  private async _updateLoxoneFromHue(mapping: DeviceMapping, data: HueEventData): Promise<void> {
    try {
      if (!mapping.loxone_control_uuid) {
        this.logger.warn('No Loxone control UUID configured for mapping', 'SYNC');
        return;
      }

      // For ColorPickerV2 controls, we need to handle state changes differently
      let commandValue: string | number | undefined;

      // Priority: Color > Color Temperature > Brightness > On/Off
      if (data.color !== undefined && data.color.xy) {
        // Color changed - send HSV format
        const brightness = data.dimming?.brightness ?? CONSTANTS.LOXONE.BRIGHTNESS_MAX;
        this.logger.debug(`XY color event: x=${data.color.xy.x.toFixed(4)}, y=${data.color.xy.y.toFixed(4)}, brightness=${brightness} (dimming=${data.dimming?.brightness ?? 'undefined'})`, 'SYNC');
        commandValue = xyToLoxoneHsv(data.color.xy.x, data.color.xy.y, brightness);
        this.logger.debug(`Color change: ${commandValue}`, 'SYNC');
      } else if (data.color_temperature !== undefined && data.color_temperature.mirek) {
        // Color temperature changed - send temp format
        const brightness = data.dimming?.brightness ?? CONSTANTS.LOXONE.BRIGHTNESS_MAX;
        this.logger.debug(`Color temp event: mirek=${data.color_temperature.mirek}, brightness=${brightness} (dimming=${data.dimming?.brightness ?? 'undefined'})`, 'SYNC');
        commandValue = mirekToLoxoneTemp(data.color_temperature.mirek, brightness);
        this.logger.debug(`Temperature change: ${commandValue}`, 'SYNC');
      } else if (data.dimming !== undefined || data.on !== undefined) {
        // Brightness or on/off changed without color data
        // For ColorPickerV2, we need to fetch current color and send complete HSV
        const controlType = await this._getControlType(mapping.loxone_control_uuid);
        this.logger.debug(`Control type for ${mapping.loxone_control_uuid}: ${controlType}`, 'SYNC');

        if (controlType === 'ColorPickerV2') {
          this.logger.debug('Fetching current Hue state to preserve color...', 'SYNC');
          // Fetch current light state from Hue to get color
          const currentState = await this._getCurrentHueState(mapping.hue_uuid, mapping.hue_type);

          if (currentState) {
            this.logger.debug(`Current Hue state: on=${currentState.on?.on}, hasColor=${!!currentState.color?.xy}, hasCT=${!!currentState.color_temperature?.mirek}`, 'SYNC');
            const brightness = data.dimming?.brightness ?? (data.on?.on ? CONSTANTS.LOXONE.BRIGHTNESS_MAX : 0);

            if (currentState.color?.xy) {
              // Light has color - send HSV with current color and new brightness
              commandValue = xyToLoxoneHsv(currentState.color.xy.x, currentState.color.xy.y, brightness);
              this.logger.debug(`Brightness change with color: ${commandValue}`, 'SYNC');
            } else if (currentState.color_temperature?.mirek) {
              // Light has color temperature - send temp format
              commandValue = mirekToLoxoneTemp(currentState.color_temperature.mirek, brightness);
              this.logger.debug(`Brightness change with CT: ${commandValue}`, 'SYNC');
            } else {
              // Fallback to brightness only
              commandValue = hueBrightnessToLoxoneDimmer(brightness);
              this.logger.debug(`Brightness change: ${brightness}`, 'SYNC');
            }
          } else {
            // Couldn't fetch state, fallback to brightness only
            const brightness = data.dimming?.brightness ?? (data.on?.on ? CONSTANTS.LOXONE.BRIGHTNESS_MAX : 0);
            commandValue = hueBrightnessToLoxoneDimmer(brightness);
            this.logger.debug(`Brightness change (no state): ${brightness}`, 'SYNC');
          }
        } else {
          // For non-ColorPickerV2 (Dimmer, Switch), just send brightness
          const brightness = data.dimming?.brightness ?? (data.on?.on ? CONSTANTS.LOXONE.BRIGHTNESS_MAX : 0);
          commandValue = hueBrightnessToLoxoneDimmer(brightness);
          this.logger.debug(`Brightness change: ${brightness}`, 'SYNC');
        }
      }

      if (commandValue !== undefined) {
        await this.loxoneClient.sendCommand(mapping.loxone_control_uuid, commandValue);
        this.logger.debug(`Sent to Loxone: ${mapping.loxone_control_uuid} = ${commandValue}`, 'SYNC');
        this.logger.success(`Synced ${mapping.hue_name} → Loxone`, 'SYNC');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update Loxone from Hue: ${message}`);
    }
  }

  /**
   * Get control type from Loxone structure
   */
  private async _getControlType(controlUuid: string): Promise<string | null> {
    try {
      // Extract base UUID (remove /AI# suffix for subcontrols)
      const baseUuid = controlUuid.split('/')[0];
      const structure = this.loxoneClient.getStructure();

      if (!structure || !structure.controls) {
        return null;
      }

      // Check in main controls
      const control = structure.controls[baseUuid];
      if (control) {
        return control.type;
      }

      // Check in subcontrols
      for (const mainControl of Object.values(structure.controls) as LoxoneControlRaw[]) {
        if (mainControl.subControls && mainControl.subControls[controlUuid]) {
          return mainControl.subControls[controlUuid].type;
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to get control type for ${controlUuid}`, 'SYNC');
      return null;
    }
  }

  /**
   * Get current Hue light state
   */
  private async _getCurrentHueState(hueUuid: string, resourceType: string): Promise<HueEventData | null> {
    try {
      const type = resourceType === 'group' ? 'grouped_light' : 'light';
      const state = await this.hueClient.getLight(hueUuid, type);

      if (!state) {
        return null;
      }

      return {
        on: state.on,
        dimming: state.dimming,
        color: state.color,
        color_temperature: state.color_temperature
      };
    } catch (error) {
      this.logger.warn(`Failed to get current Hue state for ${hueUuid}`, 'SYNC');
      return null;
    }
  }

  /**
   * Get sync statistics
   */
  getStats(): Record<string, unknown> {
    return {
      hueToLoxone: this.stats.hueToLoxone,
      loxoneToHue: this.stats.loxoneToHue,
      loopsPrevented: this.loopGuard.loopsPrevented,
      changeSourceEntries: this.loopGuard.size()
    };
  }
}

export default BidirectionalSyncManager;
