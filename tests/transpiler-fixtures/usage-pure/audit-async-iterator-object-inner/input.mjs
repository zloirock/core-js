// AsyncIteratorObject<string[]> - async mirror of IteratorObject H03 case. `.at(0)`
// routes to Array-specific helper via inner `string[]` propagation through for-await-of
async function consume(it: AsyncIteratorObject<string[]>) {
  for await (const arr of it) arr.at(0);
}
consume;
