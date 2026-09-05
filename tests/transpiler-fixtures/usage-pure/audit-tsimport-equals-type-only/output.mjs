import _Map from "@core-js/pure/actual/map/constructor";
// `import type X = require(...)` is elided by `tsc` before runtime - references resolve
// to the global. plugin must (a) NOT rewrite the import LHS to `_Map` (would create a
// duplicate `_Map` declaration on second pass), (b) emit the polyfill for `new Map()` so
// legacy targets get the runtime constructor. value-mode `import X = require(...)` is the
// shadowing form; the type modifier flips that off
import Map = require("./types");
const m = new _Map();
export { m };