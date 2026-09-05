function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      doFirst();
      return;
    } catch {
      logFailure();
    }
  }
  x.at(-1);
}
