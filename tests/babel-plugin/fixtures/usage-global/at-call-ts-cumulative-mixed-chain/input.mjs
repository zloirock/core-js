function foo(x: string | number | number[]) {
  if (typeof x === 'string') return;
  if (!Array.isArray(x)) {
    x.at(-1);
  }
}
