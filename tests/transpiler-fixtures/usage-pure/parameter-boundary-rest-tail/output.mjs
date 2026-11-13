import _at from "@core-js/pure/actual/instance/at";
// A plain rest binding cannot observe the preceding property read.
export function read(_ref, ...values) {
  let at = _at(_ref);
  return [at, values];
}