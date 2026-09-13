// A kept getter runs before its destructured binding initializes. Its returned realm still
// supplies a polyfilled constructor, through a direct literal, an alias and an assignment.
// The assignment getter observes the old binding, then the assignment installs the ponyfill.
// A constructor escaping through the getter includes its static methods.
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
