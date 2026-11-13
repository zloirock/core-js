import _at from "@core-js/pure/actual/instance/at";
// Rest already makes arguments unmapped; no extra parameter may follow it.
export function read(_ref, value, ...tail) {
  let at = _at(_ref);
  value = 9;
  return [at, arguments[1], tail];
}