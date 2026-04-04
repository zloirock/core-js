function foo(x) {
  if (typeof x === 'string' || typeof x === 'number') {
    x.at(-1);
  }
}
