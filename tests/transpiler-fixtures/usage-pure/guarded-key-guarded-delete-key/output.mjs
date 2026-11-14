import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  var _ref;
  const effects = [];
  const obj = {
    k: 1
  };
  const result = (_ref = choice ? Object : null, null == _ref ? true : delete (_ref === Object ? _Object$fromEntries((_pushMaybeArray(effects).call(effects, "args"), [["k", obj]])) : _ref.fromEntries((_pushMaybeArray(effects).call(effects, "args"), [["k", obj]]))).k[_pushMaybeArray(effects).call(effects, "key"), "k"]);
  return [result, "k" in obj];
}