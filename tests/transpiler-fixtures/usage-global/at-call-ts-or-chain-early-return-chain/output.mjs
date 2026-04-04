function foo(x: string | number | number[]) {
  if (typeof x === 'string' || Array.isArray(x)) return;
  x.at(-1);
}