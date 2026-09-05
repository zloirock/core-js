import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a user default over a STATIC leaf is dead text: the extraction binds the polyfill's own import,
// which is never undefined, so the canon drops the guard on both legs at every depth and host -
// flat, aliased, assigned, exported, in a for-init, beside a rest, under a folding computed key, under
// a proxy hop, beside a data sibling, array-wrapped, and as a pattern default composing an instance
// leaf. an INSTANCE leaf keeps its guard: the dispatch result decides through `=== void 0`
const fb = 0;
const K = 'from';
function k() {
  return 'from';
}
const viaAlias = _Array$from;
const of = _Array$of;
let viaAssign;
viaAssign = _Array$from;
export const {
  isArray: viaExport = fb
} = Array;
for (const viaForInit = _Array$from;;) {
  viaForInit;
  break;
}
const viaRestSibling = _Array$from;
const {
  from: _unused,
  ...restOf
} = Array;
const viaComputed = _Array$from;
const viaComputedSibling = _Array$from;
const ofBeside = _Array$of;
const viaStringKey = _Array$from;
const viaHop = _Array$from;
const viaHopComputed = _Array$from;
const viaBesideSibling = _Array$from;
const {
  z
} = {
  w: _globalThis,
  z: 1
};
const viaWrapped = _Array$from;
const viaPatternDefault = _nameMaybeFunction(_Array$of);
let viaAssignPatternDefault;
viaAssignPatternDefault = _nameMaybeFunction(_Array$from);
const viaHopPatternDefault = _nameMaybeFunction(_Array$of);
const viaInstance = (_ref = _atMaybeArray([1])) === void 0 ? fb : _ref;
const viaSeKey = _Array$from;
const {
  [k()]: _unused2
} = Array;
export { viaAlias, of, viaAssign, viaRestSibling, restOf, viaComputed, viaComputedSibling, ofBeside, viaStringKey, viaHop, viaHopComputed, viaBesideSibling, z, viaWrapped, viaPatternDefault, viaAssignPatternDefault, viaHopPatternDefault, viaInstance, viaSeKey };