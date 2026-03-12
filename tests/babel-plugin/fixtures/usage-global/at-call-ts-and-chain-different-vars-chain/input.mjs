function foo(x: string | number[], y: string | number) {
  if (typeof x !== 'string' && typeof y === 'number') {
    x.at(-1);
  }
}
