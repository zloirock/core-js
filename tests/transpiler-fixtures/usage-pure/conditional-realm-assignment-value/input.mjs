// A conditional assignment preserves its realm result and binds the pure constructor.
function read(enabled) {
  let C;
  const realm = enabled && ({ Map: C } = globalThis);
  if (!enabled) return [realm, C];
  const { groupBy: method = 'fallback' } = C;
  return [realm === globalThis, typeof method];
}
export const result = [read(true), read(false)];
