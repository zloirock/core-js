// member-on-conditional through a constrained array-element infer: the true branch's `U` is threaded
// from the check's array element (number[][] -> number[]), so `c.at` narrows to the array-specific
// helper. guards the constrained-infer surface against a regression that drops the element narrow.
type Cond<T> = T extends Array<infer U extends unknown[]> ? U : never;
export function f(c: Cond<number[][]>) {
  return c.at(0);
}
