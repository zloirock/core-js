function foo(x) {
  if (!(x instanceof Array)) {
    x.at(-1);
  }
}
