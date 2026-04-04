function process(x: string | number[]) {
  if (typeof x !== 'object') return;
  x.at(-1);
}
