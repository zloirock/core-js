function foo(items: number[] | never | null) {
  items.at(-1);
}
