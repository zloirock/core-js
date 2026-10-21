// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const aliasLeakIsPairPrecise = (function () {
  const twoSlots = { M: Map, P: Object };
  const aliasM = twoSlots.M;
  void aliasM;
  const { P: { keys } } = twoSlots;
  return keys;
})();
export { aliasLeakIsPairPrecise };
