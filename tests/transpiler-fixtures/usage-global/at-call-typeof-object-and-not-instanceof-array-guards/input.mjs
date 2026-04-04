function foo(x) {
  if (typeof x === 'object' && !(x instanceof Array)) {
    x.at(-1);
  }
}
