async function test(items: Iterable<Promise<string[]>>) {
  for await (const [first] of items) {
    first.at(0);
  }
}
