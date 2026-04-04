function foo(x) {
  if (x instanceof Array) return;
  x.at(-1);
}
