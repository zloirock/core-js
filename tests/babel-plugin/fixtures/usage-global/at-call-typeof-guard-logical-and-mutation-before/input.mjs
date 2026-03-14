function foo() {
  let x = bar();
  x = baz();
  typeof x === 'string' && x.at(-1);
}
