// A computed key reads a later binding before the method and remaining slots.
// The ordered read keeps that source reference, including its declaration TDZ.
export function read(factory) {
  const { [(after, 'at')]: method, after } = factory();
  return [method, after];
}
// The lowered member twin preserves the same read before its method lookup.
export function readLowered(receiver) {
  return receiver[(unboundDestructureKey, 'includes')];
}
