function example(x: string | string[]) {
  if (typeof x === 'string') {
    try {
      doFirst();
      return;
    } catch {
      throw new Error();
    }
  }
  x.at(-1);
}
