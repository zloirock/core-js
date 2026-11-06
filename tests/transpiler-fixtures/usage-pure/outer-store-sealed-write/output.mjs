import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// A retained store keeps its root claim live when an intermediate read leads
// to a sealed write. The probe, exception and effect order survive the collapse.
const log = [];
export const result = (() => {
  let held, result;
  const box = {
    value: 4
  };
  _globalThis.outerBox = box;
  try {
    result = (_pushMaybeArray(log).call(log, 'outer'), held = (_pushMaybeArray(log).call(log, 'inner'), _globalThis.window)).outerBox.value = (_pushMaybeArray(log).call(log, 'rhs'), 9);
  } catch (error) {
    result = _nameMaybeFunction(error);
  } finally {
    delete _globalThis.outerBox;
  }
  return [result, held === _globalThis, box.value];
})();
export { log };