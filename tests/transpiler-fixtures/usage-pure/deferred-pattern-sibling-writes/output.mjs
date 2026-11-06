import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Several claims share the original receiver even when a computed key writes its alias.
// The retained length and following declarator remain behind both claimed reads.
const effects = [];
let values = [4, 7];
const original = values;
const _ref = values,
  method = null == _ref ? _ref[""] : (_pushMaybeArray(effects).call(effects, 'key'), values = {
    at() {
      return 'changed';
    }
  }, _atMaybeArray(_ref)),
  contains = null == _ref ? _ref[""] : (_pushMaybeArray(effects).call(effects, 'second'), _includesMaybeArray(_ref)),
  {
    length
  } = _ref,
  after = (_pushMaybeArray(effects).call(effects, 'after'), 1);
export { method, contains, length, after };
export { effects, values, original };