async function test(records: AsyncIterable<Promise<Promise<Promise<{ items: string[] }>>>>) {
  for await (const { items } of records) {
    // @ts-expect-error the member read is the probe, and the right answer is a type without it
    items.at(-1).toFixed(2);
  }
}
