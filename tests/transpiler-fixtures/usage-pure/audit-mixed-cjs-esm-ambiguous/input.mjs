// ambiguous file: top-level ESM marker (`import`) AND CJS marker (`module.exports`).
// the top-level ESM marker wins, so emission stays ESM despite the CJS shape. optional-chain
// memoization adds a `var _refN;` whose placement must land past the import block.
import { thing } from './m.js';
const x = arr?.flat();
const y = str?.padStart(8);
module.exports = { x, y, thing };
