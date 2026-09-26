import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// TS 5.6+ IteratorObject<TYield, TReturn, TNext>: yield-expression value reads TNext slot;
// generator-like name set must recognise IteratorObject for narrow propagation
function* gen(): IteratorObject<number, void, string[]> {
  const next = yield 1;
  _atMaybeArray(next).call(next, 0);
  _includesMaybeArray(next).call(next, 'a');
}
gen();