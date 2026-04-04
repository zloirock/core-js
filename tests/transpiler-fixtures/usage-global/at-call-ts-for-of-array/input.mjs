function foo(items: string[]) {
  for (const item of items) {
    item.at(-1);
  }
}
