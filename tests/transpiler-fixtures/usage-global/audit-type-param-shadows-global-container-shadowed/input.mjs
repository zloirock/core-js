function shadowed<Array>(x: Array) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return x.at(0);
}
