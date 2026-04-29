import _at from "@core-js/pure/actual/instance/at";
// `assertString(x)` narrows x to string in the static type system, but a reassignment
// after the assertion makes that narrowing stale - runtime value can be anything the new
// init returns. without the mutation-after-guard check on assertion forms, the resolver
// would keep the string narrowing and emit `_atMaybeString`, which is wrong: a post-
// mutation Array makes `it.at` return undefined and the .call() crashes. generic
// instance dispatch is the safe widening
function assertString(x: unknown): asserts x is string {}
declare function readAnything(): unknown;
function probe(x: unknown) {
  assertString(x);
  x = readAnything();
  return _at(x).call(x, 0);
}