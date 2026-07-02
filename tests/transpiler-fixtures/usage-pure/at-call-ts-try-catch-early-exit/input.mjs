function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      return;
    } finally {
      doCleanup();
    }
  }
  x.at(-1);
}
