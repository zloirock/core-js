// A computed instance slot stays between retained siblings and their defaults.
// Each source key and getter runs once; rest excludes the consumed key.
// Assignment targets run before their reads and the assignment returns its RHS.
export function read(factory, key, fallback) {
  const { before = fallback(), [(key(), 'at')]: value = fallback(), after, ...rest } = factory();
  return [before, value, after, rest];
}
export function assign(factory, key, target, restTarget) {
  let value;
  return ({ before: target().value, [(key(), 'includes')]: value, after: target().value, ...restTarget().value } = factory());
}
export function assignMember(factory, key, target, restTarget) {
  return ({ [(key(), 'flatMap')]: target().value, ...restTarget().value } = factory());
}
export function assignPlain(factory, target) {
  return ({ before: target().x, find: target().y } = factory());
}
export function forwardDefault(factory, key) {
  const { [(key(), 'values')]: value = after, after } = factory();
  return [value, after];
}
export function coerced(factory, key, effect) {
  const { [key()]: first, [(effect(), 'findLast')]: value, ...rest } = factory();
  return [first, value, rest];
}
