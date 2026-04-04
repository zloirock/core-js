function foo(items: string[] | null) {
  for (const item of items) {
    item.at(-1);
  }
}
