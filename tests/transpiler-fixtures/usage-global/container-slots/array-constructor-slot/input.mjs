// An array element holding Object exposes its named static through an object pattern.
const constructorSlot = (function () {
  const { 0: { keys } } = [Object];
  return keys;
})();
export { constructorSlot };
