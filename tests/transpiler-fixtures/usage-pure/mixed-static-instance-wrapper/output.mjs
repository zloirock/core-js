import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// A conditional receiver keeps the instance sibling's original type.
// The constructor arm supplies its static; a user array still needs instance dispatch.
export function read(flag, user) {
  const _ref = flag ? {
    from: _Array$from,
    at: Array.at
  } : user;
  const at = _at(_ref);
  const [{
    from
  }] = [_ref];
  return [from, at];
}