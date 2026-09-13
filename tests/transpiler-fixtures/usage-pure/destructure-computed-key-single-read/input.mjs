// A sole computed-key read captures its initializer, checks it for nullishness,
// then evaluates the key and reads the property once through the instance helper.
// A key can change the source binding; the dispatch still reads the captured value.
export function read(factory, key, fallback) {
  const { [(key(), 'at')]: value = fallback() } = factory();
  return value;
}
export function reassigned(receiver, key) {
  const { [(receiver = key(), 'includes')]: value } = receiver;
  return value;
}
export function loop(factory, key) {
  for (let { [(key(), 'values')]: value } = factory();;) return value;
}
export const { [(effect(), 'findLast')]: publicMethod } = receiver();
