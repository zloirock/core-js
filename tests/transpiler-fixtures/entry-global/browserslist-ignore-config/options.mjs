import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  plugins: [
    [
      '@core-js',
      {
        method: 'entry-global',
        version: '4.0',
        configPath: dirname(fileURLToPath(import.meta.url)),
        ignoreBrowserslistConfig: true,
      },
    ],
  ],
};
