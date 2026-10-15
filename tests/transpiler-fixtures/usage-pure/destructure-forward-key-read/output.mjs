import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A computed key reads a later binding before the method and remaining slots.
// The ordered read keeps that source reference, including its declaration TDZ.
export function read(factory) {
  const _ref = factory(),
    method = null == _ref ? _ref[""] : (after, _at(_ref)),
    {
      after
    } = _ref;
  return [method, after];
}
// The lowered member twin preserves the same read before its method lookup.
export function readLowered(receiver) {
  return receiver, unboundDestructureKey, _includes(receiver);
}