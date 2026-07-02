import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A DOUBLE side effect: one in the proxy-global ROOT wrapper `(eff(), globalThis)` AND one in the proxy HOP
// key `[(eff(), 'self')]`, on an instance-method receiver. the root wrapper has no bare proxy-global identifier
// for the natural visitor to rewrite, so the receiver collapse must fold BOTH effects ahead of the pure root in
// source-eval order (wrapper first, then hop key) and drop the redundant hop: `(eff('a'), eff('b'), _globalThis)
// .Array.prototype`. uniform across an instance `.call`, a destructure binding, and a DOUBLE hop (three effects).
// multi-type methods prove the receiver-TYPE inference resolves THROUGH the double-SE collapse: `includes` / `at`
// on Array.prototype narrow to the ARRAY variant, `includes` on String.prototype to the STRING variant - an
// array-only method would resolve regardless and prove nothing. distinct import per line.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return 0;
}
const callInstance = _includesMaybeArray((eff('a'), eff('b'), _globalThis).Array.prototype).call([1, 2], 1);
const at = _atMaybeArray((eff('c'), eff('d'), _globalThis).Array.prototype);
const doubleHop = _includesMaybeString((eff('e'), eff('f'), eff('g'), _globalThis).String.prototype).call('abc', 'a');
export { callInstance, at, doubleHop, log };