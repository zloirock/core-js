import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `typeof E.A` resolves `E` in the VALUE namespace: a lexically-nearer `const E` shadows the
// outer enum `E`, so `E.A` is the const member (array), not the enum member (string)
enum E {
  A = "x",
}
function f() {
  const E = { A: [1, 2, 3] };
  let x: typeof E.A;
  return _atMaybeArray(x).call(x, 0);
}