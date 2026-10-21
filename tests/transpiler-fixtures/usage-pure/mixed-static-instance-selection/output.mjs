import _Array$from from "@core-js/pure/actual/array/from";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
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
      w: flag ? Array : user
    },
    from = _ref2 === Array ? _Array$from : _ref2.from,
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