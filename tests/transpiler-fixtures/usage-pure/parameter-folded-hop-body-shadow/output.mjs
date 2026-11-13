import _at from "@core-js/pure/actual/instance/at";
// Moving the nested receiver must not move the hop's reference into its body scope.
const Y = 'y';
export function read(_ref = source()) {
  let [_ref2] = _ref;
  let at = _at(_ref2.y);
  let Y;
  return at;
}