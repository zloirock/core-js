import _at from "@core-js/pure/actual/instance/at";
import _Object$assign from "@core-js/pure/actual/object/assign";
export function inlineAtCopyingSlot() {
  return _Object$assign(target, {
    items: [1, 2],
    read() {
      var _ref;
      return _at(_ref = this.items).call(_ref, 0);
    }
  });
}