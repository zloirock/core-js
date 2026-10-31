import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
export function inlineAtInspectedSlot() {
  return Object.keys({
    cells: [1, 2],
    read() {
      var _ref;
      return _includesMaybeArray(_ref = this.cells).call(_ref, 1);
    }
  });
}