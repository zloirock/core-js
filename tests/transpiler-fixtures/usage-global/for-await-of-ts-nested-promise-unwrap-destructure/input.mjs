async function test(records: AsyncIterable<Promise<Promise<{ name: string }>>>) {
  for await (const { name } of records) {
    // @ts-expect-error the member read is the probe, and the right answer is a type without it
    name.at(-1).toFixed(2);
  }
}
