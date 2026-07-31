import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the pure flavor of the proxy-global root arms: the ARRAY-init negative is the load-bearing cell -
// a named key off an array literal is undefined at runtime, so substituting the pure constructor
// would hand working statics to broken code (wrong value); the binding must stay raw
const {
  Promise: P
} = [_globalThis];
export const notSubstituted = () => P.resolve(1);

// a plain Identifier binding the whole array is no alias either
const M = [_globalThis];
export const notSubstitutedWhole = () => M.resolve(1);

// the POSITIONAL array-wrap spelling keeps resolving (the guard must not over-tighten)
const MW = _Map;
export const stillResolves = new MW([[1, 2]]);

// a PATCH through the interop `.default` chain routes onto the SAME injected constructor the
// reads use - the patch and the read land on one object, exactly like the bare proxy spelling
function _interopRequireDefault(m) {
  return m && m.__esModule ? m : {
    default: m
  };
}
var XW = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
_Map.groupBy = function patched() {
  return 'p';
};
export const patchWins = _Map.groupBy([], x => x);