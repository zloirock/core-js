function foo(x: Exclude<number[] | null, null>) {
  x.at(-1);
}
