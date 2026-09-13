import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// Defaults on claimed static leaves are dead because pure imports are defined. Direct and computed
// static extractions drop those defaults while retaining computed-key effects. Instance leaves
// still test the dispatch result before choosing their default.
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
const {
  from: viaRestSibling = fb,
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
const _ref2 = Array,
  viaSeKey = null == _ref2 ? _ref2[""] : (k(), _Array$from);
export { viaAlias, of, viaAssign, viaRestSibling, restOf, viaComputed, viaComputedSibling, ofBeside, viaStringKey, viaHop, viaHopComputed, viaBesideSibling, z, viaWrapped, viaPatternDefault, viaAssignPatternDefault, viaHopPatternDefault, viaInstance, viaSeKey };