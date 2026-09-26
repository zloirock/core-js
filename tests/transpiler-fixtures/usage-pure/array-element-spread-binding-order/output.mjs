import _at from "@core-js/pure/actual/instance/at";
// A known slot before an opaque spread keeps its instance polyfill.
// The spread evaluates first; getter reads and bindings then follow source order.
export function read(make, values) {
  const [_ref, _ref2, ..._ref3] = [2, make(() => [before, rest]), ...values];
  const before = _ref;
  const at = _at(_ref2);
  const rest = _ref3;
  return [before, at, rest];
}