function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      doFirst();
      return;
    } catch {
      throw new Error();
    }
  }
  x.at(-1);
}
