import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _self from "@core-js/pure/actual/self";
import _WeakMap from "@core-js/pure/actual/weak-map";
var _ref;
// A selection every arm of which yields the realm names the realm, effectful arms included: the claim
// above it takes its pure entry and the selection runs once ahead as an effect. An arm that may yield
// another object keeps the identity guard.
let e = 0;
const c = pick();
const user = make();
export const viaAlternate = (c ? _globalThis : (e++, _self), _Promise$any);
export const viaBoth = (c ? (e++, _globalThis) : (e--, _self), _Map$groupBy);
export const viaCall = (c ? (e++, _globalThis) : _globalThis, _Array$from)([1]);
export const viaCtor = (c ? (e++, _self) : _globalThis, _WeakMap);
export const keepsUserArm = (_ref = (c ? (e++, _globalThis) : user).Object, _ref === Object ? _Object$fromEntries : _ref.fromEntries);
export { e };