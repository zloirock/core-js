function process(x: string | number[]) {
  if (typeof x === 'string') return;
  x.at(-1);
}
