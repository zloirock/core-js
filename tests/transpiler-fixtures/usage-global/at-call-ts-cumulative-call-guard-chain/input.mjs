function foo(x: string | number | number[]) {
  if (Number.isFinite(x)) return;
  if (typeof x !== 'object') return;
  x.at(-1);
}
