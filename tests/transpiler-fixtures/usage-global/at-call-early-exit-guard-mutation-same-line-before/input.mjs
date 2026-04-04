function foo() {
  let x = bar();
  if (typeof x !== 'string') return;
  x = baz(), x.at(0);
}
