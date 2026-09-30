// A for-of binding receives the container and writes its constructor slot before the nested read.
const escapedByForOfHead = (function () {
  const loopBox = { k: Object };
  for (const x of [loopBox]) x.k = Map;
  const { k: { defineProperties } } = loopBox;
  return defineProperties;
})();
export { escapedByForOfHead };
