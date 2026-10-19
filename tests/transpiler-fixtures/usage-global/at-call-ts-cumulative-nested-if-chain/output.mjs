function foo(x: string | number | number[]) {
  if (typeof x !== 'string') {
    if (!Array.isArray(x)) {
      // @ts-expect-error the member read is the probe, and the right answer is a type without it
      x.at(-1);
    }
  }
}