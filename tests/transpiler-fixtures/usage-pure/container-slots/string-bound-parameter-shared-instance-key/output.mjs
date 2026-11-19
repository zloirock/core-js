import _at from "@core-js/pure/actual/instance/at";
// A const-bound computed key reads the string-valued parameter default.
// Pure reads the actual receiver; supplied arguments retain their own methods.
const KEY = 'at';
export function read(_ref = 'abc') {
  let at = _at(_ref);
  return at;
}