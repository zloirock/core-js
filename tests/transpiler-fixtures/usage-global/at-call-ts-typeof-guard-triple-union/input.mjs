function foo(x: string | number[] | boolean) {
  if (typeof x === 'object') {
    x.at(-1);
  }
}
