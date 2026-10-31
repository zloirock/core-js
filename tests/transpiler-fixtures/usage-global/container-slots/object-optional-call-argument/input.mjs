// An optional call can hand the container to a callee that writes its constructor slot.
function consume(first) { if (first) first.k = Map; }
const escapedByOptionalCall = (function () {
  const optionalBox = { k: Object };
  consume?.(optionalBox);
  const { k: { isSealed } } = optionalBox;
  return isSealed;
})();
export { escapedByOptionalCall };
