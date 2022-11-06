import './build-indexes.mjs';
import './clean-and-copy.mjs';

process.env.FORCE_COLOR = '1';

$`npm run build-compat`;
