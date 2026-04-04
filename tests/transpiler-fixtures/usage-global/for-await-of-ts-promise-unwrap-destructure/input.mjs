async function test(records: AsyncIterable<Promise<{ items: number[] }>>) {
  for await (const { items } of records) {
    items.at(-1).toFixed(2);
  }
}
