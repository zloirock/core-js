import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
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