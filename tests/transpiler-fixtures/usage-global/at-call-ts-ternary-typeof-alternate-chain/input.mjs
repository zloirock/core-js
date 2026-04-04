function process(x: string | number[]) {
  return typeof x === 'string' ? null : x.at(-1);
}
