import './build-indexes.mjs';
import './clean-and-copy.mjs';

process.env.FORCE_COLOR = '1';

await $`npm run build-compat`;
