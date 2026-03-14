function foo() {
  let x = bar();
  typeof x === 'string' && (x = baz(), x.at(-1));
}
