// TS 5.6+ IteratorObject<TYield, TReturn, TNext>: yield-expression value reads TNext slot;
// generator-like name set must recognise IteratorObject for narrow propagation
function* gen(): IteratorObject<number, void, string[]> {
  const next = yield 1;
  next.at(0);
  next.includes('a');
}
gen();
