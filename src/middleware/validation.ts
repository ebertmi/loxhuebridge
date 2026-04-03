/**
 * Validation Middleware
 * Express middleware for validating request parameters
 */

import { Request, Response, NextFunction } from 'express';
import {
  isValidDeviceName,
  isValidControlValue,
  isValidLoxoneName,
  isValidHueUuid,
  isValidDeviceType,
  isValidIpAddress,
  isValidPort,
  isValidTransitionTime
} from '../config/validation';
import Logger from '../utils/logger';

// Logger instance (set during initialization)
let logger: Logger | null = null;

/**
 * Set logger instance for validation logging
 */
export function setLogger(loggerInstance: Logger): void {
  logger = loggerInstance;
}

/**
 * Validate light control command parameters
 */
export function validateLightCommand(req: Request, res: Response, next: NextFunction): void {
  const name = req.params.name as string;
  const value = req.params.value as string;

  // Validate device name
  if (!isValidDeviceName(name)) {
    const error = {
      error: 'Invalid device name format',
      details: 'Device name must be alphanumeric with optional spaces, hyphens, underscores, dots (1-100 chars, no leading/trailing spaces)',
      name: name
    };

    if (logger) {
      logger.warn(`Validation failed: Invalid device name`, 'API', {
        name: name,
        length: name?.length,
        hasLeadingSpace: name !== name?.trim(),
        hasMultipleSpaces: /\s{2,}/.test(name)
      });
    }

    res.status(400).json(error);
    return;
  }

  // Validate control value
  if (!isValidControlValue(value)) {
    const error = {
      error: 'Invalid control value',
      details: 'Value must be 0-100 for dimming or a valid color format',
      value: value
    };

    if (logger) {
      logger.warn(`Validation failed: Invalid control value`, 'API', {
        name: name,
        value: value
      });
    }

    res.status(400).json(error);
    return;
  }

  next();
}

/**
 * Validate mapping data
 */
export function validateMapping(req: Request, res: Response, next: NextFunction): void {
  const mapping = req.body;

  if (!Array.isArray(mapping)) {
    const error = {
      error: 'Invalid mapping format',
      details: 'Mapping must be an array'
    };

    if (logger) {
      logger.warn(`Validation failed: Mapping not an array`, 'API', {
        receivedType: typeof mapping
      });
    }

    res.status(400).json(error);
    return;
  }

  // Validate each mapping entry
  for (let i = 0; i < mapping.length; i++) {
    const entry = mapping[i];

    if (!entry.loxone_name || !isValidLoxoneName(entry.loxone_name)) {
      const error = {
        error: 'Invalid Loxone name',
        details: 'Loxone name must be alphanumeric with optional spaces, hyphens, underscores, dots (1-100 chars, no leading/trailing spaces)',
        entry,
        index: i
      };

      if (logger) {
        logger.warn(`Validation failed: Invalid Loxone name in mapping`, 'API', {
          index: i,
          loxoneName: entry.loxone_name,
          length: entry.loxone_name?.length,
          hasLeadingSpace: entry.loxone_name !== entry.loxone_name?.trim()
        });
      }

      res.status(400).json(error);
      return;
    }

    if (!entry.hue_uuid || !isValidHueUuid(entry.hue_uuid)) {
      const error = {
        error: 'Invalid Hue UUID',
        details: 'Hue UUID must be a valid UUID format',
        entry,
        index: i
      };

      if (logger) {
        logger.warn(`Validation failed: Invalid Hue UUID in mapping`, 'API', {
          index: i,
          loxoneName: entry.loxone_name,
          hueUuid: entry.hue_uuid
        });
      }

      res.status(400).json(error);
      return;
    }

    if (!entry.hue_type || !isValidDeviceType(entry.hue_type)) {
      const error = {
        error: 'Invalid device type',
        details: 'Device type must be: light, group, sensor, or button',
        entry,
        index: i
      };

      if (logger) {
        logger.warn(`Validation failed: Invalid device type in mapping`, 'API', {
          index: i,
          loxoneName: entry.loxone_name,
          hueType: entry.hue_type
        });
      }

      res.status(400).json(error);
      return;
    }
  }

  next();
}

/**
 * Validate Loxone configuration
 */
export function validateLoxoneConfig(req: Request, res: Response, next: NextFunction): void {
  const { loxoneIp, loxonePort, transitionTime } = req.body;

  if (loxoneIp && !isValidIpAddress(loxoneIp)) {
    const error = {
      error: 'Invalid Loxone IP address',
      details: 'Must be a valid IPv4 address',
      loxoneIp: loxoneIp
    };

    if (logger) {
      logger.warn(`Validation failed: Invalid Loxone IP`, 'API', {
        loxoneIp: loxoneIp
      });
    }

    res.status(400).json(error);
    return;
  }

  if (loxonePort && !isValidPort(loxonePort)) {
    const error = {
      error: 'Invalid Loxone port',
      details: 'Port must be between 1 and 65535',
      loxonePort: loxonePort
    };

    if (logger) {
      logger.warn(`Validation failed: Invalid Loxone port`, 'API', {
        loxonePort: loxonePort
      });
    }

    res.status(400).json(error);
    return;
  }

  if (transitionTime !== undefined && !isValidTransitionTime(transitionTime)) {
    const error = {
      error: 'Invalid transition time',
      details: 'Transition time must be between 0 and 10000ms',
      transitionTime: transitionTime
    };

    if (logger) {
      logger.warn(`Validation failed: Invalid transition time`, 'API', {
        transitionTime: transitionTime
      });
    }

    res.status(400).json(error);
    return;
  }

  next();
}

/**
 * Validate Hue Bridge registration
 */
export function validateBridgeRegistration(req: Request, res: Response, next: NextFunction): void {
  const { ip } = req.body;

  if (!ip || !isValidIpAddress(ip)) {
    const error = {
      error: 'Invalid Bridge IP address',
      details: 'Must be a valid IPv4 address',
      ip: ip
    };

    if (logger) {
      logger.warn(`Validation failed: Invalid Bridge IP`, 'API', {
        ip: ip
      });
    }

    res.status(400).json(error);
    return;
  }

  next();
}
