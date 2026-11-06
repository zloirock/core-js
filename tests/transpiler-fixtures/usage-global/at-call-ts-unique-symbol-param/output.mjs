// @ts-expect-error a unique symbol where tsc refuses one is the shape under test
function foo(x: unique symbol) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  x.at(-1);
}