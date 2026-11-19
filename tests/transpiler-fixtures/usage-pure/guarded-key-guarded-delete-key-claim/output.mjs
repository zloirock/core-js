import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  var _ref, _ref2;
  const effects = [];
  const obj = {
    k: 1
  };
  const result = (_ref = choice ? Object : null, null == _ref ? true : delete (_ref === Object ? _Object$fromEntries([["k", obj]]) : _ref.fromEntries([["k", obj]])).k[(_pushMaybeArray(effects) || 0).call(effects, _atMaybeArray(_ref2 = [7]).call(_ref2, -1)), "k"]);
  return [result, "k" in obj];
}