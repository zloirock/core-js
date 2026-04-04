function foo(x) {
  if (typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') {
    if (typeof x === 'number' || typeof x === 'boolean') return;
    x.at(-1);
  }
}
