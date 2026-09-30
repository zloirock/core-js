import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// An unknown computed pattern key may detach a method that repositions the array receiver.
const patternDynamicDetaches = function () {
  const patternDynamicBox = [Object, _Map];
  const {
    [_globalThis.pick]: pd
  } = patternDynamicBox;
  pd?.call?.(patternDynamicBox);
  const {
    0: {
      isExtensible
    }
  } = patternDynamicBox;
  return isExtensible;
}();
export { patternDynamicDetaches };