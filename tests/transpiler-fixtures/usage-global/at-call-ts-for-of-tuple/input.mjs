function foo(items: [string, string]) {
  for (const item of items) {
    item.at(-1);
  }
}
