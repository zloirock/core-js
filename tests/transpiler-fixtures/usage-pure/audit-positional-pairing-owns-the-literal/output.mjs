import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A plain array literal gives the paired claim its element value. A proxy-global element reads
// the substituted root; an opaque getter hop keeps the returned value's type, including the
// string instance family for `at`. The literal's own `at` value needs no polyfill.
const proxyRoot = function () {
  const [{
    Array: {
      from
    }
  }] = [{
    Array: {
      from: _Array$from
    }
  }];
  return from;
}();
const opaqueHopOwnName = function () {
  const box = {
    get Array() {
      return {
        prototype: {
          at: 1
        }
      };
    }
  };
  const [{
    Array: {
      prototype: {
        at
      }
    }
  }] = [box];
  return at;
}();
const opaqueHopTyped = function () {
  const box = {
    get Array() {
      return {
        prototype: 'ab'
      };
    }
  };
  const at = _atMaybeString(box.Array.prototype);
  return at;
}();
export { proxyRoot, opaqueHopOwnName, opaqueHopTyped };