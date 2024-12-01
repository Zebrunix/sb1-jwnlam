import { LogLevel } from '../../types/logger';

export class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` ${JSON.stringify(data)}` : ''}`;
  }

  static info(message: string, data?: any) {
    console.log(this.formatMessage('info', message, data));
  }

  static warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message, data));
  }

  static error(message: string, error?: any) {
    console.error(this.formatMessage('error', message, error));
  }
}