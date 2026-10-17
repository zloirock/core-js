import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// caller visibility is not part of the question: a self-reference is an extra caller, and the
// synthesized default is right for it too - an argument the recursion passes still wins
const selfReferencing = function r({
  getOwnPropertyNames
} = {
  getOwnPropertyNames: _Object$getOwnPropertyNames
}) {
  return _globalThis.never ? r({
    getOwnPropertyNames: null
  }) : getOwnPropertyNames;
}();
export { selfReferencing };