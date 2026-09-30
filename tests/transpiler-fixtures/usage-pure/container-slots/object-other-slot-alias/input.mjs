// Reading an alias of one constructor slot leaves a different constructor slot available.
const aliasLeakIsPairPrecise = (function () {
  const twoSlots = { M: Map, P: Object };
  const aliasM = twoSlots.M;
  void aliasM;
  const { P: { keys } } = twoSlots;
  return keys;
})();
export { aliasLeakIsPairPrecise };
