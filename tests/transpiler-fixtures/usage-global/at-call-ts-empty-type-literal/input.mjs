function f(x: {}) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  x.at(-1);
}
