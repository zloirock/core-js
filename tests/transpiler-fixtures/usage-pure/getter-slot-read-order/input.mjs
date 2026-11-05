// Getter-supplied realm values are evaluated once before a nested constructor is bound or assigned.
// Direct, aliased and assignment hosts preserve the getter's observed binding value.
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
