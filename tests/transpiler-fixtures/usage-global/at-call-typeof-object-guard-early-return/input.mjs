function foo(x) {
  if (typeof x === 'object') return;
  x.at(-1);
}
