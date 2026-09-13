import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A computed key effect folded into a collapsed receiver keeps the polyfills it calls.
// The trailing helper reads that receiver once, so the effect rides its argument without
// a memo. Each row has a distinct effect and consumer; a kept assignment still precedes its key.
const log = [];
const arr = [1, [2]];
export const viaReceiverFold = _nameMaybeFunction((_pushMaybeArray(log).call(log, 'a'), _Map));

// a chain-assign root places the key effect AFTER its assignment, which is the source's own order.
let held;
export const viaChainAssignRoot = (held = _globalThis, _flatMaybeArray(arr).call(arr).length, _Set).size;

// other consumers carry the key effect ahead of the collapsed binding or dispatch;
// the effect keeps its own polyfills there too
export const viaPrototypeRead = (_includesMaybeArray(arr).call(arr, 1), _WeakMap).prototype;
export const viaPlainReceiver = (_flatMapMaybeArray(arr).call(arr, x => [x]).length, _atMaybeArray(arr).call(arr, 0));

// NEGATIVE: an effect with nothing polyfillable inside it has nothing to keep alive
let n = 0;
export const viaPlainEffect = _nameMaybeFunction((n++, _Promise));
export const effects = log;