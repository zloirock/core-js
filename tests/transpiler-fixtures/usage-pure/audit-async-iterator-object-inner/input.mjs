// `AsyncIteratorObject<string[]>` - async mirror of the IteratorObject case. the element
// type `string[]` propagates through `for await...of`, narrowing `arr.at(0)` to the
// array-specific instance polyfill
async function consume(it: AsyncIteratorObject<string[]>) {
  for await (const arr of it) arr.at(0);
}
consume;
