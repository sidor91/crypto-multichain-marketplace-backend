import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodenv: process.env.NODE_ENV,
}));
