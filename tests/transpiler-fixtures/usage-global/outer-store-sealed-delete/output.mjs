import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A retained store keeps its root claim live when an intermediate read leads
// to a sealed delete. The probe, exception and effect order survive the collapse.
const log = [];
export const result = (() => {
  let held, result;
  const box = {
    value: 4
  };
  globalThis.outerBox = box;
  try {
    result = delete ((log.push('outer'), held = (log.push('inner'), globalThis.window))?.self).outerBox.value;
  } catch (error) {
    result = error.name;
  } finally {
    delete globalThis.outerBox;
  }
  return [result, held === globalThis, box.value];
})();
export { log };