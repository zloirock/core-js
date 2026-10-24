// TS 5.6+ AsyncIteratorObject<TYield, TReturn, TNext>: yielded value type for async-gen
// resolves through param-0 (TYield); narrowed to array on consumption side
async function* gen(): AsyncIteratorObject<number[], void, void> {
  yield [1, 2, 3];
}
async function consume() {
  for await (const arr of gen()) {
    arr.at(0);
    arr.includes(1);
  }
}
consume();
