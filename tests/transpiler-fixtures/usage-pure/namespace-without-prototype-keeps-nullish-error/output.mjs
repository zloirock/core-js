import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A namespace has no prototype; its nested pattern still rejects the absent value.
export function declaration() {
  const {
    Math: {
      trunc,
      prototype: {
        [_Symbol$iterator]: iterator
      }
    }
  } = {
    Math: {
      trunc: _Math$trunc,
      prototype: {
        get [_Symbol$iterator]() {
          return _getIteratorMethod(_globalThis.Math.prototype);
        }
      }
    }
  };
  return [trunc, iterator];
}
export function parameter({
  JSON: {
    stringify,
    prototype: {
      [_Symbol$iterator]: iterator
    }
  }
} = {
  JSON: {
    stringify: _JSON$stringify,
    prototype: {
      [_Symbol$iterator]: _getIteratorMethod(_globalThis.JSON.prototype)
    }
  }
}) {
  return [stringify, iterator];
}