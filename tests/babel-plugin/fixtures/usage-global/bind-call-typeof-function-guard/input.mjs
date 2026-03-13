function foo(x) {
  if (typeof x === 'function') {
    x.bind(null);
  }
}
