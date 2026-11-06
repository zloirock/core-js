function foo(x: string | number | number[]) {
  if (typeof x !== 'string' && !Array.isArray(x)) {
    // narrowed branch
  } else {
    return;
  }
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  x.at(-1);
}