async function foo(items: Iterable<Promise<string>>) {
  for await (const x of items) {
    x.at(-1);
  }
}
