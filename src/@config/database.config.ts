import { DataSource, DataSourceOptions } from 'typeorm';

import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const sslProd = {
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

let ssl = {};

if (process.env.NODE_ENV === 'production') {
  ssl = sslProd;
}
const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DB_URL,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  logging: false,
  migrations: [__dirname + '/../db/migrations/*.ts'],
  synchronize: false,
  migrationsRun: false,
  ...ssl,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config);
