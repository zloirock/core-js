import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An undefined literal slot reaches its own fallback before dispatch.
// Null still throws; it is not replaced by an always-defined mirror.
export function read(box) {
  function use({
    y: {
      at
    } = fallback()
  } = {
    y: box.list
  }) {
    return at;
  }
  return use();
}