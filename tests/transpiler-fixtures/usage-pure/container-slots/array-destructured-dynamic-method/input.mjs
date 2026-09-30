// An unknown computed pattern key may detach a method that repositions the array receiver.
const patternDynamicDetaches = (function () {
  const patternDynamicBox = [Object, Map];
  const { [globalThis.pick]: pd } = patternDynamicBox;
  pd?.call?.(patternDynamicBox);
  const { 0: { isExtensible } } = patternDynamicBox;
  return isExtensible;
})();
export { patternDynamicDetaches };
