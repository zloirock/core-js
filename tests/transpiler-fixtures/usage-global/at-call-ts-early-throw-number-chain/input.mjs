function process(x: string | number) {
  if (typeof x === 'number') throw new Error();
  x.at(-1);
}
