import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const effects = [];
export function read(choose) {
  const {
    from,
    of
  } = choose ? ((() => {
    var _ref;
    (_pushMaybeArray(effects) || 0).call(effects, _atMaybeArray(_ref = [1]).call(_ref, 0));
    return Array;
  })(), {
    from: _Array$from,
    of: _Array$of
  }) : {
    from: _Array$from,
    of: _Array$of
  };
  return [from([1]), of(2)];
}
export function fallback({
  from,
  missing = 7
} = (null == _globalThis.window ? void 0 : {
  from: _Array$from,
  missing: _globalThis.Array.missing
}) || (_pushMaybeArray(effects).call(effects, 'fallback'), {
  from: _Array$from,
  missing: Array.missing
})) {
  return [from([3]), missing];
}
export { effects };