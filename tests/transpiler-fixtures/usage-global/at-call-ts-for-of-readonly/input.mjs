function foo(items: readonly string[]) {
  for (const item of items) {
    item.at(-1);
  }
}
