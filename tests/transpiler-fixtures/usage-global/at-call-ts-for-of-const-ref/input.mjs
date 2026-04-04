function foo(items: string[]) {
  const ref = items;
  for (const item of ref) {
    item.at(-1);
  }
}
