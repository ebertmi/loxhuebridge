import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DeviceMapping,
  DeviceStatus,
  DetectedItem,
  HueTargetsResponse,
  HueScene,
  LoxoneControl,
  LoxoneControlsResponse,
  LoxoneCommandResponse,
  LogEntry,
  AppSettings,
  DiagnosticsData,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // Targets (Hue devices)
  getTargets(): Observable<HueTargetsResponse> {
    return this.http.get<HueTargetsResponse>(`${this.baseUrl}/targets`).pipe(
      catchError(this.handleError)
    );
  }

  // Mappings
  getMappings(): Observable<DeviceMapping[]> {
    return this.http.get<DeviceMapping[]>(`${this.baseUrl}/mapping`).pipe(
      catchError(this.handleError)
    );
  }

  addMapping(mapping: Partial<DeviceMapping>): Observable<DeviceMapping> {
    return this.http.post<DeviceMapping>(`${this.baseUrl}/mapping`, mapping).pipe(
      catchError(this.handleError)
    );
  }

  updateMapping(loxoneName: string, update: Partial<DeviceMapping>): Observable<DeviceMapping> {
    return this.http.put<DeviceMapping>(`${this.baseUrl}/mapping/${encodeURIComponent(loxoneName)}`, update).pipe(
      catchError(this.handleError)
    );
  }

  deleteMapping(loxoneName: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/mapping/${encodeURIComponent(loxoneName)}`).pipe(
      catchError(this.handleError)
    );
  }

  // Status
  getStatus(): Observable<Record<string, DeviceStatus>> {
    return this.http.get<Record<string, DeviceStatus>>(`${this.baseUrl}/status`).pipe(
      catchError(this.handleError)
    );
  }

  // Detected commands
  getDetected(): Observable<DetectedItem[]> {
    return this.http.get<DetectedItem[]>(`${this.baseUrl}/detected`).pipe(
      catchError(this.handleError)
    );
  }

  clearDetected(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/detected`).pipe(
      catchError(this.handleError)
    );
  }

  // Scenes
  getScenes(): Observable<HueScene[]> {
    return this.http.get<HueScene[]>(`${this.baseUrl}/scenes`).pipe(
      catchError(this.handleError)
    );
  }

  activateScene(uuid: string): Observable<void> {
    return this.http.post<void>(`/scene/${uuid}/on`, {}).pipe(
      catchError(this.handleError)
    );
  }

  deactivateScene(uuid: string): Observable<void> {
    return this.http.post<void>(`/scene/${uuid}/off`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Loxone controls
  getLoxoneControls(): Observable<LoxoneControl[]> {
    return this.http.get<LoxoneControlsResponse>(`${this.baseUrl}/loxone/controls`).pipe(
      map(response => response.controls || []),
      catchError(this.handleError)
    );
  }

  sendLoxoneCommand(uuid: string, command: string): Observable<LoxoneCommandResponse> {
    return this.http.post<LoxoneCommandResponse>(`${this.baseUrl}/loxone/command`, { uuid, command }).pipe(
      catchError(this.handleError)
    );
  }

  // Settings
  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(`${this.baseUrl}/settings`).pipe(
      catchError(this.handleError)
    );
  }

  updateSettings(settings: Partial<AppSettings>): Observable<AppSettings> {
    return this.http.put<AppSettings>(`${this.baseUrl}/settings`, settings).pipe(
      catchError(this.handleError)
    );
  }

  // Logs
  getLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs`).pipe(
      catchError(this.handleError)
    );
  }

  clearLogs(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/logs`).pipe(
      catchError(this.handleError)
    );
  }

  // Diagnostics
  getDiagnostics(): Observable<DiagnosticsData> {
    return this.http.get<DiagnosticsData>(`${this.baseUrl}/diagnostics`).pipe(
      catchError(this.handleError)
    );
  }

  // Export
  downloadExport(type: 'outputs' | 'inputs' | 'scenes'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${type}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Setup
  discoverBridges(): Observable<{ ip: string; id: string }[]> {
    return this.http.get<{ ip: string; id: string }[]>(`${this.baseUrl}/setup/discover`).pipe(
      catchError(this.handleError)
    );
  }

  registerBridge(ip: string): Observable<{ success: boolean; api_key?: string; error?: string }> {
    return this.http.post<{ success: boolean; api_key?: string; error?: string }>(`${this.baseUrl}/setup/register`, { ip }).pipe(
      catchError(this.handleError)
    );
  }

  saveLoxoneConfig(config: {
    loxoneIp: string;
    loxonePort: number;
    debug?: boolean;
    transitionTime?: number;
    loxoneUser?: string;
    loxonePassword?: string;
    loxoneHttpPort?: number;
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/setup/loxone`, config).pipe(
      catchError(this.handleError)
    );
  }

  checkSetupStatus(): Observable<{ configured: boolean }> {
    return this.http.get<{ configured: boolean }>(`${this.baseUrl}/setup/status`).pipe(
      catchError(this.handleError)
    );
  }

  // Light command (direct control)
  sendLightCommand(name: string, value: string): Observable<void> {
    return this.http.get<void>(`/${encodeURIComponent(name)}/${encodeURIComponent(value)}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message || `Error ${error.status}`;
    }
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
