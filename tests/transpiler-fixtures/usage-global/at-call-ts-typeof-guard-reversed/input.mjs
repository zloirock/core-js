function foo(x: string | number[]) {
  if ('string' === typeof x) {
    x.at(-1);
  }
}
