function foo(x: { items: number[]; name: string }["items"]) {
  x.at(-1);
}
