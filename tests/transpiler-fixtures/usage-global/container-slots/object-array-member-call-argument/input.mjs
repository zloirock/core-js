// An argument selected from an inline array still hands the contained object to the callee.
function consume(first) { if (first) first.k = Map; }
const escapedInsideArrayLiteral = (function () {
  const litBox = { k: Object };
  consume([litBox][0]);
  const { k: { getOwnPropertyNames } } = litBox;
  return getOwnPropertyNames;
})();
export { escapedInsideArrayLiteral };
