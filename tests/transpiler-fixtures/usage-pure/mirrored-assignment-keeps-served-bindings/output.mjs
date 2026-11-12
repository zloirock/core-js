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
  } = pick() ? {
    from: _Array$from,
    prototype: {
      at: _atMaybeArray(Array.prototype)
    }
  } : {
    from: _Array$from,
    prototype: {
      at: _atMaybeArray(Array.prototype)
    }
  });
  return [from([3])[0], at.call([4], 0)];
}
export const truthy = read(() => true);
export const falsy = read(() => false);