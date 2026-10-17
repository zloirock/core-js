import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
function probe(k) {
  const local = {
    data: [5],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.data).call(_ref, 5);
    }
  };
  local[k];
  _JSON$stringify(local);
  return local.read();
}
probe('data');