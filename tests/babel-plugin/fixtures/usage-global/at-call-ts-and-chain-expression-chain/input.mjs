function foo(x: string | number | number[]) {
  return typeof x !== 'string' && !Array.isArray(x) && x.at(-1);
}
