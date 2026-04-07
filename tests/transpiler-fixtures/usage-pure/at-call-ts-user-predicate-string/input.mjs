// regression: user-defined type predicate `x is string` used to be ignored by
// parseTypeGuard (only typeof/instanceof/KNOWN_STATIC_TYPE_GUARDS recognized).
// now we resolve the predicate's return type annotation and build an equivalent
// typeof guard. expect `_atMaybeString`.
function isStr(x: unknown): x is string {
  return typeof x === 'string';
}
function f(x: unknown) {
  if (isStr(x)) return x.at(0);
}
