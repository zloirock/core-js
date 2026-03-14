function process(x: string | number[]) {
  if (typeof x === 'string') {
    if (condition1) {
      if (condition2) {
        return;
      } else {
        return;
      }
    } else {
      throw new Error();
    }
  }
  x.at(-1);
}
