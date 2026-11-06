// caller visibility is not part of the question: a self-reference is an extra caller, and the
// synthesized default is right for it too - an argument the recursion passes still wins
const selfReferencing = (function r({ getOwnPropertyNames } = Object) {
  return globalThis.never ? r({ getOwnPropertyNames: null }) : getOwnPropertyNames;
})();
export { selfReferencing };
