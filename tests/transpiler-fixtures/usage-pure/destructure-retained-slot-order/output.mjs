import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _values from "@core-js/pure/actual/instance/values";
// Instance reads preserve receiver, key and default order across host forms.
export function read(factory, key, fallback) {
  const {
    before = fallback(),
    [(key(), 'at')]: value = fallback(),
    after,
    ...rest
  } = factory();
  return [before, value, after, rest];
}
export function assign(factory, key, target, restTarget) {
  let value;
  return {
    before: target().value,
    [(key(), 'includes')]: value,
    after: target().value,
    ...restTarget().value
  } = factory();
}
export function assignMember(factory, key, target, restTarget) {
  return {
    [(key(), 'flatMap')]: target().value,
    ...restTarget().value
  } = factory();
}
export function assignPlain(factory, target) {
  var _ref;
  return _ref = factory(), {
    before: target().x
  } = _ref, target().y = _findMaybeArray(_ref), _ref;
}
export function forwardDefault(factory, key) {
  var _ref3;
  const _ref2 = factory(),
    value = null == _ref2 ? _ref2[""] : (key(), (_ref3 = _values(_ref2)) === void 0 ? after : _ref3),
    {
      after
    } = _ref2;
  return [value, after];
}
export function coerced(factory, key, effect) {
  const {
    [key()]: first,
    [(effect(), 'findLast')]: value,
    ...rest
  } = factory();
  return [first, value, rest];
}