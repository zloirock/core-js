import _at from "@core-js/pure/actual/instance/at";
// 3+ overload siblings where the assertion predicate is NOT on the first header. the argument is
// DECLARED `unknown` and the guard parser holds no path, so it cannot see whether a narrowing is in
// force at the call: reading the declaration as a refutation of the `number` header picked the arm
// behind it, which is wrong wherever the argument was narrowed. nothing discriminates the set here,
// so it stays undiscriminated and the generic helper dispatches
function isStr(x: number): boolean;
function isStr(x: unknown): asserts x is string;
function isStr(x: unknown) {}
function probe(x: unknown) {
  isStr(x);
  return _at(x).call(x, 0);
}