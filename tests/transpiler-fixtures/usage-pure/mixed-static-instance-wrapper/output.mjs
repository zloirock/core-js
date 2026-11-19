import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// A mixed selecting array element supplies one captured receiver for its static and instance leaves.
// The Array.from branch is served without replacing a user branch's own method.
export function read(flag, user) {
  const [_ref] = [flag ? Array : user];
  const from = _ref === Array ? _Array$from : _ref.from;
  const at = _at(_ref);
  return [from, at];
}