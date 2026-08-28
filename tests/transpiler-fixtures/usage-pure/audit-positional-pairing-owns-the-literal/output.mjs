import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// over a plain array LITERAL the pairing OWNS the element: the claim resolves through the value the
// element names, so the slot-rename route stands down and no minted name appears in any row. the
// sides of that: a PROXY-GLOBAL element, whose claim reads the substituted root, and an OPAQUE hop
// through a getter, whose claim reads the literal that getter returns - once where that literal
// carries the name itself and pulls nothing, once where it is a STRING and `at` says which family
// answered, which is what a lost type would show as the generic dispatcher
const proxyRoot = function () {
  const from = _Array$from;
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