async function foo(x: AsyncIterable<string>) {
  for await (const item of x) {
    item.at(0);
  }
}
