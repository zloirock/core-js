// Ambiguous file: top-level ESM marker (`import`) AND CJS marker (`module.exports`).
// `hasTopLevelESM` wins per `importStyle` precedence, so emission stays ESM despite
// CJS shape. Optional-chain memoization adds a `var _refN;` whose placement must
// land past the import block.
import { thing } from './m.js';
const x = arr?.flat();
const y = str?.padStart(8);
module.exports = { x, y, thing };
