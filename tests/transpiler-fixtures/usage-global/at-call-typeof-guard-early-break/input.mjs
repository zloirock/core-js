function foo(x) {
  while (true) {
    if (typeof x === 'string') break;
    x.at(-1);
  }
}
