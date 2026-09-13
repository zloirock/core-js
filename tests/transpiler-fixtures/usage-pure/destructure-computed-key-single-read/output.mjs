import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _values from "@core-js/pure/actual/instance/values";
var _ref5;
// A sole computed-key read captures its initializer, checks it for nullishness,
// then evaluates the key and reads the property once through the instance helper.
// A key can change the source binding; the dispatch still reads the captured value.
export function read(factory, key, fallback) {
  var _ref2;
  const _ref = factory(),
    value = null == _ref ? _ref[""] : (key(), (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2);
  return value;
}
export function reassigned(receiver, key) {
  const _ref3 = receiver,
    value = null == _ref3 ? _ref3[""] : (receiver = key(), _includes(_ref3));
  return value;
}
export function loop(factory, key) {
  for (let _ref4 = factory(), value = null == _ref4 ? _ref4[""] : (key(), _values(_ref4));;) return value;
}
export const publicMethod = (_ref5 = receiver(), null == _ref5 ? _ref5[""] : (effect(), _findLastMaybeArray(_ref5)));