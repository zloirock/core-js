// Every shape the per-file census exists for, in the one mode that reads almost none of it:
// entry-global replaces the entry import and mints no name of its own, so the destructures stay,
// the monkey-patched static stays, and the user's temp-shaped slot names are never reserved
// against anything. The minifier-shape split is the ONE census answer this mode does consume,
// so the collapsed sequence below must still come out split.
import 'core-js';

var _ref = 1;
globalThis['_ref2'] = 2;

Array.from = function () { return []; };

const { from } = Array;
const { Map: M } = globalThis;

(sideEffect(), ({ keys } = Object), from);

function sideEffect() { }

export { from, M, keys, _ref };
var keys;
