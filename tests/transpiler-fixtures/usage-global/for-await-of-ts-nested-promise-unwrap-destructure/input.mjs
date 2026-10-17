async function test(records: AsyncIterable<Promise<Promise<{ name: string }>>>) {
  for await (const { name } of records) {
    name.at(-1).toFixed(2);
  }
}
