// A retained store keeps its root claim live when an intermediate read leads
// to a sealed write. The probe, exception and effect order survive the collapse.
const log = [];
export const result = (() => {
  let held, result;
  const box = { value: 4 };
  globalThis.outerBox = box;
  try {
    result = ((log.push('outer'), held = (log.push('inner'), globalThis.window))?.self).outerBox.value = (log.push('rhs'), 9);
  } catch (error) {
    result = error.name;
  } finally {
    delete globalThis.outerBox;
  }
  return [result, held === globalThis, box.value];
})();
export { log };
