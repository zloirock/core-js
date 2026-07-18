// the babel WILDCARD interop shape (all imports of a module merge into one wildcard var when
// any is `import * as`) plus the merged-import alias hop babel emits: the `.default` member
// still carries the global, so writes through the hop must taint like the direct form
function _interopRequireWildcard(e, t) { return e && e.__esModule ? e : { default: e }; }
var _g = _interopRequireWildcard(require("@core-js/pure/actual/global-this"));
var ns = _g;
ns.default.Map = Shim;
new Map([[1, 2]]);
