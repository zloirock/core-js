function foo(items: Awaited<Promise<number[]>>) {
  items.at(-1);
}
