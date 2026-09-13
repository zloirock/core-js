// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
