function foo(x) {
  if (typeof x === 'string' || typeof x === 'number' || typeof x === 'bigint') {
    x.at(-1);
  }
}
