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
var _ref, _ref2;
// a computed KEY carrying an effect, on a receiver a trailing dispatch collapses: the collapse
// discards the receiver span while the dispatch folds that same effect into its memo, so the
// effect's text is kept by one channel and thrown away by the other. its own polyfills have to
// survive with the text - subsuming them left a raw call in the memo with its import gone.
// a DISTINCT effect call and a DISTINCT consumer per row keep every module attributable
const log = [];
const arr = [1, [2]];
export const viaMemoFold = (_ref = (_pushMaybeArray(log).call(log, 'a'), _Map), _nameMaybeFunction(_ref));

// a chain-assign root places the key effect AFTER its assignment, which is the source's own order.
// the emitters differ only in whether the sequence is memoized before the helper reads it - one
// evaluation either way, sidecar-locked
let held;
export const viaChainAssignRoot = (held = _globalThis, _flatMaybeArray(arr).call(arr).length, _Set).size;

// the same effect under consumers that do NOT fold it into a memo: the key effect rides ahead of
// the collapsed binding, and its polyfills survive there too
export const viaPrototypeRead = (_includesMaybeArray(arr).call(arr, 1), _WeakMap).prototype;
export const viaPlainReceiver = (_flatMapMaybeArray(arr).call(arr, x => [x]).length, _atMaybeArray(arr).call(arr, 0));

// NEGATIVE: an effect with nothing polyfillable inside it has nothing to keep alive
let n = 0;
export const viaPlainEffect = (_ref2 = (n++, _Promise), _nameMaybeFunction(_ref2));
export const effects = log;