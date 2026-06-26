import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global receiver wrapped in NESTED sequences (`(c++, (d++, globalThis.self))`) must collapse to the
// root the SAME way as a single sequence - the unplugin SE-tail substitution peeled only ONE level, grabbed
// the inner sequence (not the proxy leaf) and bailed, leaving a raw `globalThis.self` (undefined off-engine)
// while babel flattened via the shared recursive peel. lines vary by CONSUMING form (instance call, instance
// call via another method, symbol-iterator access) and by nesting DEPTH (double, triple); a single-sequence
// line is the depth control. each binds a DISTINCT method so the rewritten helper identifies the line, and the
// trailing counters prove every dropped-prefix side effect runs in source order.
let a = 0,
  b = 0,
  c = 0,
  d = 0;
const memberDirect = _flatMaybeArray((c++, d++, _globalThis).Array.prototype).call([1, [2]]);
const instanceAt = _atMaybeArray((c++, d++, _globalThis).Array.prototype).call([1], 0);
const symbolIter = _getIteratorMethod((a++, b++, c++, _globalThis).Array.prototype);
const single = _includesMaybeArray((d++, _globalThis).Array.prototype).call([1], 1);
export { memberDirect, instanceAt, symbolIter, single, a, b, c, d };