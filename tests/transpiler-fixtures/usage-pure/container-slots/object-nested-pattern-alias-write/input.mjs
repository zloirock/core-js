// A nested literal pattern binds an alias that can replace the original constructor slot.
const escapedByNestedPatternLiteral = (function () {
  const deepBox = { k: Object };
  const [{ q: reBound }] = [{ q: deepBox }];
  reBound.k = Map;
  const { k: { getOwnPropertyNames: deepRead } } = deepBox;
  return deepRead;
})();
export { escapedByNestedPatternLiteral };
