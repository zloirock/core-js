import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const effects = [];
export function read(choose) {
  const {
    [(_pushMaybeArray(effects).call(effects, 'key'), 'from')]: from,
    missing = (_pushMaybeArray(effects).call(effects, 'default'), 7)
  } = choose ? function (_ref) {
    return {
      "from": _Array$from,
      missing: _ref.missing
    };
  }((() => {
    var _ref2;
    (_pushMaybeArray(effects) || 0).call(effects, _atMaybeArray(_ref2 = [1]).call(_ref2, 0));
    return Array;
  })()) : {
    "from": _Array$from,
    missing: Array.missing
  };
  _pushMaybeArray(effects).call(effects, 'body');
  return [from([3]), missing];
}
export { effects };