function foo(x: string | number | number[]) {
  if (typeof x !== 'string' && !Array.isArray(x)) {
    x.at(-1);
  }
}