// A write through a conditional container alias may replace the matching slot of either arm.
const branchEscapeBothArms = (function () {
  const armA = { k: Object };
  const armB = { k: Object };
  const picked = globalThis.cond ? armA : armB;
  picked.k = Map;
  const { k: { getOwnPropertyNames: fromA } } = armA;
  const { k: { getOwnPropertyDescriptor: fromB } } = armB;
  return [fromA, fromB];
})();
export { branchEscapeBothArms };
