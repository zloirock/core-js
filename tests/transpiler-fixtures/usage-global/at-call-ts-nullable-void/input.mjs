function foo(items: number[] | void) {
  // @ts-expect-error a void arm, nullish at runtime, is the shape under test
  items.at(-1);
}
