// An argument selected from an inline object still hands the contained container to the callee.
function consume(first) { if (first) first.k = Map; }
const escapedInsideObjectValue = (function () {
  const objBox = { k: Object };
  consume({ inner: objBox }.inner);
  const { k: { isFrozen } } = objBox;
  return isFrozen;
})();
export { escapedInsideObjectValue };
