import { Injectable } from '@nestjs/common';

@Injectable()
export default class ConfigService {
  get<T = any>(key: string): string {
    return process.env[key];
  }
  static ENV_NAME = 'ENV_NAME';
  static DATABASE_HOST = 'DATABASE_HOST';
  static DATABASE_PORT = 'DATABASE_PORT';
  static DATABASE_USERNAME = 'DATABASE_USERNAME';
  static DATABASE_PWD = 'DATABASE_PWD';
  static DATABASE_NAME = 'DATABASE_NAME';
}
