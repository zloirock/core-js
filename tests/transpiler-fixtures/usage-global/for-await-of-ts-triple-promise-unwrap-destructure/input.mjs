async function test(records: AsyncIterable<Promise<Promise<Promise<{ items: string[] }>>>>) {
  for await (const { items } of records) {
    items.at(-1).toFixed(2);
  }
}
