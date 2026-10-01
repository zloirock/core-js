import _Array$from from "@core-js/pure/actual/array/from";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Every selected receiver keeps its own instance methods beside the constructor arm.
// Unknown arrays and strings both remain possible when no caller type is known.
export function flat(flag, user) {
  const _ref = flag ? {
      from: _Array$from,
      at: Array.at
    } : user,
    from = _ref === Array ? _Array$from : _ref.from,
    at = _at(_ref);
  return [from, at];
}
export function nested(flag, user) {
  const {
      w: _ref2
    } = {
      w: flag ? {
        from: _Array$from,
        includes: Array.includes
      } : user
    },
    {
      from
    } = _ref2,
    includes = _includes(_ref2);
  return [from, includes];
}
export function loop(flag, user) {
  for (const _ref3 of [flag ? {
    from: _Array$from,
    map: Array.map
  } : user]) {
    const {
        from
      } = _ref3,
      map = _mapMaybeArray(_ref3);
    return [from, map];
  }
}