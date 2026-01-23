import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const envConfig = `
export const environment = {
  production: true,
  baseApiUrl: '${process.env['BASE_API_URL']}'
};
`;

// Ensure we are writing relative to the project root
fs.writeFileSync(
  './src/environments/environment.development.ts',
  envConfig
);
