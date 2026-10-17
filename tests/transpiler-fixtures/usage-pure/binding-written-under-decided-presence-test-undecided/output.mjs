import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
export function undecided() {
  let value = [1];
  if (_globalThis.flag) value = 'abc';
  return _at(value).call(value, 0);
}