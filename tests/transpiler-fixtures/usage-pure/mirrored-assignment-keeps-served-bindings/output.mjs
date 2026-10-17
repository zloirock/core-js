import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A mirror serves `from` without consuming its assignment target.
// A later retained prototype capture still writes `from` in its source slot.
export function read(pick) {
  var _ref;
  let from, at;
  _ref = pick() ? {
    from: _Array$from,
    prototype: {
      at: _atMaybeArray(Array.prototype)
    }
  } : {
    from: _Array$from,
    prototype: {
      at: _atMaybeArray(Array.prototype)
    }
  };
  ({
    from
  } = _ref);
  at = _atMaybeArray(_ref.prototype);
  return [from([3])[0], at.call([4], 0)];
}
export const truthy = read(() => true);
export const falsy = read(() => false);