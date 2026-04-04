function foo() {
  let x = bar();
  x = baz();
  if (typeof x !== 'string') return;
  x.at(-1);
}
