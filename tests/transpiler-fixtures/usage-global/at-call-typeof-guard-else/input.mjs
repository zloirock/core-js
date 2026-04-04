function foo(x) {
  if (typeof x === 'string') {
    x.toUpperCase();
  } else {
    x.at(-1);
  }
}
