// an enum or a namespace binds a runtime object no binding view carries a declarator for: read as an
// operand of a selection, a for-of element, an `in` test or a destructure it is the user's own value, never
// a container literal that always yields, so the built-in beside it loads its static, one per row. a const
// enum read as a value is a TypeScript error the parsers and the transform still accept
enum E { A, from = 2 }
const enum K { A }
namespace N { export const from = 1; }
namespace Outer.Inner { export const from = 1; }
export const viaOr = (E || Promise).allSettled([]);
export const viaNullish = (N ?? Math).trunc;
export const viaTernary = (c ? Outer : Array).of(1);
export const viaConstEnum = K || {};
for (const M of [E, Map]) use((M || Object).groupBy([], f));
export const viaIn = 'isInteger' in (N || Number);
export const { fromCodePoint } = Outer || String;
