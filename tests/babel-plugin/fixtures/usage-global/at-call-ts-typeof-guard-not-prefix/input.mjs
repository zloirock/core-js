function foo(x: string | number[]) {
  if (!(x instanceof Array)) {
    x.at(-1);
  }
}
