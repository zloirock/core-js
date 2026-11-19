function foo(x: [string, number?]) {
  const [a, b] = x;
  a.at(0);
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  b.at(0);
}
