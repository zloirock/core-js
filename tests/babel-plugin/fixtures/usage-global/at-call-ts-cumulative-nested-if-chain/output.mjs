function foo(x: string | number | number[]) {
  if (typeof x !== 'string') {
    if (!Array.isArray(x)) {
      x.at(-1);
    }
  }
}