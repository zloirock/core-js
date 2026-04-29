// `AsyncIteratorObject<string[]>` - async iterator-object generic with element type
// inferred for await-of consumption. the element type `string[]` propagates through
// `for await...of`, narrowing `arr.at(0)` to the array-specific instance polyfill
async function consume(it: AsyncIteratorObject<string[]>) {
  for await (const arr of it) arr.at(0);
}
consume;
