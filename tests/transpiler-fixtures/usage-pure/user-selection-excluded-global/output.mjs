import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// pure counts a global the targets need and a filter drops (`Promise`, excluded here) present as usage-global does:
// the data subset carries it, so a presence test over it decides - read through an alias, a receiver, a destructure
// or a `||` the alias holds - and so does a `||` reading it off the realm, as its bare name and a served global
// (`Map`) do. The live arm stays raw, pure substituting nothing the user excludes; a static it serves takes its entry.
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = _Promise$withResolvers();
export const viaReceiver = _Promise$try(task);
const C = Promise;
export const viaKnownArm = C.from([1]);
export const {
  fromAsync
} = Promise;
const Q = Promise;
export const viaFallback = Q.of(1);
const M = _Map;
export const served = _Map$groupBy(list, key);
const R = _globalThis.Promise;
export const viaRealmFallback = R.fromEntries(pairs);