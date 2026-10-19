// @ts-expect-error an annotated loop head, which tsc refuses, is the shape under test
for (const x: number[] of items) {
  x.at(-1);
}
