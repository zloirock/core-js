import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
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
  const {
    [(key(), 'values')]: value = after,
    after
  } = factory();
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