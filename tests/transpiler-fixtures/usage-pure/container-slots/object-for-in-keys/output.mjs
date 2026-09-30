import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
// For-in exposes property names without handing out or replacing the constructor slot.
const forInKeysLeakNothing = function () {
  const inBox = {
    k: Object
  };
  let last;
  for (const key in inBox) last = key;
  void last;
  const {
    k: {
      defineProperty
    }
  } = {
    k: {
      defineProperty: _Object$defineProperty
    }
  };
  return defineProperty;
}();
export { forInKeysLeakNothing };