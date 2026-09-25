// The realm-guarded well-known symbol `in` test beyond its base form (`conditional-realm-symbol-members`):
// two written realm proxies name one realm and share one identity branch, and a custom arm keeps
// its own membership test.
export function readEither(flag, value) {
  let realm;
  if (flag) realm = globalThis; else realm = self;
  return realm.Symbol.iterator in value;
}
export function readCustom(flag, value) {
  let realm;
  if (flag) realm = globalThis; else realm = { Symbol: { iterator: 'k' } };
  return realm.Symbol.iterator in value;
}
// Only a bare identifier operand is repeated per branch and only the iterator entry has a call
// shape: another operand or symbol keeps the member route.
export function readMember(flag, box) {
  if (flag) { var realm = globalThis; }
  return realm.Symbol.iterator in box.value;
}
export function readAsync(flag, value) {
  if (flag) { var realm = globalThis; }
  return realm.Symbol.asyncIterator in value;
}
