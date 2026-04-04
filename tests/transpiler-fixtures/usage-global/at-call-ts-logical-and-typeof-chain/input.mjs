function process(x: string | number[]) {
  return typeof x === 'string' && x.at(-1);
}
