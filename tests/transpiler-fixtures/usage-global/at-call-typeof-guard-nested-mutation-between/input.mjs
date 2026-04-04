function foo() {
  let x = bar();
  if (typeof x === 'string') {
    if (cond) {
      x = baz();
    }
    x.at(-1);
  }
}
