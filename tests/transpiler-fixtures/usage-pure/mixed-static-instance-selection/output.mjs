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
  } : user;
  const at = _at(_ref);
  const {
    from
  } = _ref;
  return [from, at];
}
export function nested(flag, user) {
  const _ref2 = flag ? {
    from: _Array$from,
    includes: Array.includes
  } : user;
  const includes = _includes(_ref2);
  const {
    w: {
      from,
      includes: _unused
    }
  } = {
    w: _ref2
  };
  return [from, includes];
}
export function loop(flag, user) {
  for (const _ref3 of [flag ? {
    from: _Array$from,
    map: Array.map
  } : user]) {
    let map = _mapMaybeArray(_ref3);
    let {
      from
    } = _ref3;
    return [from, map];
  }
}