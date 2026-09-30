// An unknown method key may name a repositioning method before the nested slot read.
const repositionedByDynamicKey = (function () {
  const dynBox = [Object, Map];
  dynBox[globalThis.pick]();
  const { 0: { isSealed } } = dynBox;
  return isSealed;
})();
export { repositionedByDynamicKey };
