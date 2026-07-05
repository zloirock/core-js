import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a tuple optional slot (`[T?]`) admits undefined: `??` on the element may yield the
// string fallback and must dispatch generically, not through an array-Maybe
declare const t: [number[]?];
_at(_ref = t[0] ?? 'fallback').call(_ref, 0);