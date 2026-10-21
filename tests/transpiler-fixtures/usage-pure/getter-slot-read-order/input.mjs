// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
export function direct(log) {
  const { w: { WeakSet: Value } } = { get w() { log.push('direct'); return globalThis; } };
  return Value;
}
export function aliased(log) {
  const source = { get w() { log.push('alias'); return globalThis; } };
  const { w: { WeakMap: Value } } = source;
  return Value;
}
export function assigned(log) {
  let Value = 'before';
  ({ w: { Map: Value } } = { get w() { log.push(Value); return globalThis; } });
  return Value;
}
