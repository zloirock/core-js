function foo(x: number[] & ReadonlyArray<number>) {
  x.at(-1);
}
