import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const localCarrier = {};
localCarrier.g = [{
  list: [7],
  has() {
    var _ref;
    return _includesMaybeArray(_ref = this.list).call(_ref, 7);
  }
}];
localCarrier.g[0].has();