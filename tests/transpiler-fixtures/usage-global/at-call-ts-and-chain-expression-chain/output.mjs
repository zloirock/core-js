function foo(x: string | number | number[]) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return typeof x !== 'string' && !Array.isArray(x) && x.at(-1);
}