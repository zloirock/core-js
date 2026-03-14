function foo() {
  let x = bar();
  if (typeof x === 'string') {
    x = baz();
    x.includes('a');
  }
}
