import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  var _ref;
  const effects = [];
  const obj = {
    k: 1
  };
  const target = {
    take(x) {
      _pushMaybeArray(effects).call(effects, typeof x);
      return obj;
    }
  };
  const result = delete target.take((_ref = choice ? Object : null, null == _ref ? void 0 : _ref === Object ? _Object$fromEntries([]) : _ref.fromEntries([]))).k;
  return [result, "k" in obj];
}