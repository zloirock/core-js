import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
var _ref;
// on targets that carry the realm natively there is no realm entry to compare through, and the
// raw `globalThis` IS the realm on every one of them: the realm-proxy candidates (`window`, `self`,
// `globalThis`) collapse to that one comparator - never a bare `window` / `self`, which a
// non-browser target lacks. the static still needs its polyfill on these targets
var held = {};
var slot = held.k;
var probe;
slot = slot === void 0 ? (probe = globalThis.window) != null ? probe : globalThis : slot;
export const viaKeyed = (slot === globalThis ? _Map : slot.Map).groupBy;
var other = held.o;
other = other === void 0 ? self : other;
export const viaSelf = (other === globalThis ? _Promise : other.Promise).withResolvers;
// ... and through a name the realm hop is stored under first
var AliasedPromise = other.Promise;
export const viaStoredHop = (_ref = AliasedPromise, _ref === Promise ? _Promise$try : _ref.try);