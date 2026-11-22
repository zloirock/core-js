function example(x: string | string[]) {
  if (typeof x === 'string') {
    try {
      doFirst();
      return;
    } catch {
      logFailure();
    }
  }
  x.at(-1);
}
