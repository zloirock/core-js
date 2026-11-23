import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A mirror serves both methods without consuming their assignment targets.
// Native pattern writes keep their source order without redispatching a served leaf.
export function read(pick) {
  let from, at;
  ({
    from,
    prototype: {
      at
    }
  } = pick() ? (_ref => {
    return {
      from: _Array$from,
      get prototype() {
        return {
          at: _atMaybeArray(_ref.prototype)
        };
      }
    };
  })(Array) : (_ref2 => {
    return {
      from: _Array$from,
      get prototype() {
        return {
          at: _atMaybeArray(_ref2.prototype)
        };
      }
    };
  })(Array));
  return [from([3])[0], at.call([4], 0)];
}
export const truthy = read(() => true);
export const falsy = read(() => false);