import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _at from "@core-js/pure/actual/instance/at";
import _Object$assign from "@core-js/pure/actual/object/assign";
export async function read() {
  var _ref;
  const item = _Object$assign([17], {
    then(done) {
      done('xy');
    }
  });
  for await (const value of _valuesMaybeArray(_ref = [item]).call(_ref)) return _at(value).call(value, -1);
}