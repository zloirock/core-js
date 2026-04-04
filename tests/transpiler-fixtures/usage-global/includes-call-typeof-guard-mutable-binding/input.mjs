function foo() {
  let x = bar();
  x = baz();
  if (typeof x === 'string') {
    x.includes('a');
  }
}
