function foo(items: Set<string>) {
  for (const item of items) {
    item.at(-1);
  }
}
