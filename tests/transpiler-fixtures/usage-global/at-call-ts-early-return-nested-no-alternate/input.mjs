function process(x: string | number[]) {
  if (typeof x === 'string') {
    if (x.length > 5) {
      return;
    }
  }
  x.at(-1);
}
