function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      doFirst();
    } finally {
      throw new Error();
    }
  }
  x.at(-1);
}
