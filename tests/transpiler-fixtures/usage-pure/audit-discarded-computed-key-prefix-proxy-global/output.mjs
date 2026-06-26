import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIterator from "@core-js/pure/actual/get-iterator";
// A PURE proxy-global (`globalThis` / `Symbol`) buried in a DISCARDED computed-key sequence prefix
// (`x[(globalThis, 'includes')]`) is peeled to the tail key, and the polyfill swap drops the whole `[...]`
// text. the dropped proxy-global must NOT keep a stranded `globalThis -> _globalThis` rewrite queued
// against eliminated source (text emitter would crash composing it). a side-effecting prefix operand
// (`n++`) is instead re-emitted ahead of the result. distinct dispatch + method per line: instance
// drop, static collapse, symbol-iterator, and a mixed side-effect-plus-proxy prefix.
let n = 0;
const arr = [[1]];
const instanceKey = _includesMaybeArray(arr).call(arr, 1);
const staticKey = _Array$from([1, 2]);
const symbolKey = [..._getIterator(arr)];
const mixedSe = (n++, _atMaybeArray(arr).call(arr, 0));
export { instanceKey, staticKey, symbolKey, mixedSe, n };