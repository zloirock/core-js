function foo(x: string | number[]) {
  if (typeof x === 'object') {
    x.at(-1);
  }
}
