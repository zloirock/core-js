function foo(items: unknown) {
  for (const item of (items as string[])) {
    item.at(-1);
  }
}
