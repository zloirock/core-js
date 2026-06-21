import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// ambiguous file: top-level ESM marker (`import`) AND CJS marker (`module.exports`).
// the top-level ESM marker wins, so emission stays ESM despite the CJS shape. optional-chain
// memoization adds a `var _refN;` whose placement must land past the import block.
import { thing } from './m.js';
const x = arr == null ? void 0 : _flatMaybeArray(arr).call(arr);
const y = str == null ? void 0 : _padStartMaybeString(str).call(str, 8);
module.exports = {
  x,
  y,
  thing
};