function foo(items: number[] | never | never) {
  items.at(-1);
}
