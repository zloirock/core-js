import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
// the copied receiver's FUNCTION body is re-polyfilled SCOPE-AWARELY (visitor-driven, not a flat node walk):
// a global shadowed by a local binding (`Map`) stays raw, while a genuinely-free global (`Set`) substitutes -
// in BOTH the copy and the kept residual. a flat copy-substituter blind to the function's own scope would
// wrongly rewrite the shadowed `Map`. distinct from the plain function-body fixtures by the shadowing axis.
const a = _atMaybeArray([() => { const Map = 1; return [Map, _Set]; }]);
const { y: { at: _unused }, k } = { y: [() => { const Map = 1; return [Map, _Set]; }], k: 1 };
export const r = [a, k];
