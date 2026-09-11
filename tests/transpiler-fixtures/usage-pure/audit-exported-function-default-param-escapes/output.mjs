import _at from "@core-js/pure/actual/instance/at";
// an exported function escapes the module: an external caller can pass any argument, so a defaulted
// param's default type is not authoritative - the call result resolves to the generic helper
export function f(x = [1, 2, 3]) {
  return _at(x).call(x, 0);
}