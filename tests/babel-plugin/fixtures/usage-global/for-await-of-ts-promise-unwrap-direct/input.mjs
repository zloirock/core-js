async function test(items: Iterable<Promise<string[]>>) {
  for await (const arr of items) {
    arr.at(-1).padEnd(5);
  }
}
