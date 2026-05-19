import _at from "@core-js/pure/actual/instance/at";
var _ref;
// narrow-by-assignment must bail when the RHS ObjectExpression contains a
// SpreadElement. spread can override any literal key at runtime
// (`{kind:'a', ...x}` where `x.kind === 'b'`), so narrowing to the 'a' branch
// based on the explicit `kind:'a'` literal would be unsound. fallback: w stays
// the unrefined `Shape` union, .at uses the generic instance polyfill
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const init: Shape;
declare const fragment: Partial<Shape>;
let w: Shape = init;
w = { kind: 'a', data: 'hi', ...fragment };
_at(_ref = w.data).call(_ref, 0);