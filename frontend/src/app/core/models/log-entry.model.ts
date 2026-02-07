export type LogCategory = 'HUE' | 'LOXONE' | 'SYSTEM' | 'ERROR' | 'DEBUG' | 'SYNC' | 'LIGHT' | 'UDP';

export type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | 'SUCCESS';

export interface LogEntry {
  time: string;
  level: LogLevel;
  cat: LogCategory;
  msg: string;
}

export interface LogFilter {
  category: LogCategory | 'ALL';
}
