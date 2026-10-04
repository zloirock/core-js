import _at from "@core-js/pure/actual/instance/at";
// An instance field initializer writes to a union-typed binding before a typeof guard.
// Type resolution stays conservative across the deferred class-field write.
// This construction writes a string, so the guarded instance call is skipped.
function f(v: string | number[]) {
  let x: string | number[] = v;
  class C {
    g = x = "str";
  }
  new C();
  if (typeof x !== "string") {
    return _at(x).call(x, 0);
  }
  return undefined;
}
f([[1]]);