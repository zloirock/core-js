import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// An unknown method key may name a repositioning method before the nested slot read.
const repositionedByDynamicKey = function () {
  const dynBox = [Object, _Map];
  dynBox[_globalThis.pick]();
  const {
    0: {
      isSealed
    }
  } = dynBox;
  return isSealed;
}();
export { repositionedByDynamicKey };