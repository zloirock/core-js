import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Positional capture uses the array element's value, including a value returned by a getter.
// Native own methods stay untouched; a returned string selects string instance dispatch.
const proxyRoot = function () {
  const [{
    Array: {
      from
    }
  }] = [_globalThis];
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