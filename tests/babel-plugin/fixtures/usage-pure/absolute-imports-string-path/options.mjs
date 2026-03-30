import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Use the project root as absoluteImports base path — same result as `true` but via string
const root = dirname(fileURLToPath(import.meta.url)).replace(/tests.*/, '');

export default {
  plugins: [
    [
      '@core-js',
      {
        method: 'usage-pure',
        version: '4.0',
        targets: { ie: 11 },
        absoluteImports: root,
      },
    ],
  ],
};
