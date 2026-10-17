import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// dereferenced-only targets and slots keep the narrow
const [localPattern] = [{
  data: ['y'],
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.data).call(_ref, 5);
  }
}];
localPattern.read();