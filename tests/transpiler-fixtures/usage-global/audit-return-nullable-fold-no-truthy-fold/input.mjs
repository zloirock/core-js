// the cross-return body fold drops the nullable return arm, but the call may still return
// null at runtime and `??` may yield the string fallback: usage-global injects the union
// of both operand shapes (es.array.at + es.string.at). plain JS - no annotations involved
function f(c) {
  if (!c) return null;
  return [1, 2];
}
(f(x) ?? 'fallback').at(0);
