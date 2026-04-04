function foo(x) {
  if (typeof x !== 'string' && typeof x !== 'number') return;
  x.at(-1);
}
