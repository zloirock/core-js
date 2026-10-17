import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const readsOnly = {
  cells: [1, 2],
  size() {
    return this.cells.length;
  },
  read() {
    var _ref;
    return _includesMaybeArray(_ref = this.cells).call(_ref, 1);
  }
};
readsOnly.size();