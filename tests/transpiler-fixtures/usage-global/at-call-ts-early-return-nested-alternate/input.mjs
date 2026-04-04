function process(x: string | number[]) {
  if (typeof x === 'string') {
    doSomething();
  } else {
    if (condition) {
      return;
    } else {
      throw new Error();
    }
  }
  x.at(-1);
}
