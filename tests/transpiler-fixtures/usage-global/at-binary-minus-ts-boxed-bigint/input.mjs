function test(a: BigInt, b: BigInt) {
  // @ts-expect-error arithmetic tsc refuses is the shape under test
  (a - b).at(-1);
}
