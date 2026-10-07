import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A presence test over a global the targets need and a filter drops (`Promise`, excluded here) is answered
// by nothing this build does, nor is a `||` reading it off the realm: every canon reading the selection - an
// alias, a receiver, a destructure, a `||` the alias holds - keeps both operands live, the user's fallback
// reachable. Its bare name decides, an engine lacking it throwing first, as a served global (`Map`) does.
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = (P === _globalThis.Promise ? _Promise$withResolvers : P.withResolvers.bind(P))();
export const viaReceiver = (typeof Promise !== 'undefined' ? Promise : MyPromise).try(task);
const C = typeof Promise !== 'undefined' ? Promise : Array;
export const viaKnownArm = (C === Array ? _Array$from : C.from.bind(C))([1]);
export const {
  fromAsync
} = typeof Promise !== 'undefined' ? Promise : {
  fromAsync: _Array$fromAsync
};
const Q = Promise;
export const viaFallback = Q.of(1);
const M = _Map;
export const served = _Map$groupBy(list, key);
const R = _globalThis.Promise || Object;
export const viaRealmFallback = (R === Object ? _Object$fromEntries : R.fromEntries.bind(R))(pairs);