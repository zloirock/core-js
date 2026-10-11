// an enum or a namespace binds a runtime object no binding view carries a declarator for: read as an
// operand of a selection, a for-of element, an `in` test or a destructure it is the user's own value, never
// a container literal or a built-in, and every claim through it keeps its live read. a const enum read as a
// value is a TypeScript error the parsers and the transform still accept
enum E { A, from = 2 }
const enum K { A }
namespace N { export const from = 1; }
namespace Outer.Inner { export const from = 1; }
export const viaOr = (E || Object).groupBy([], f);
export const viaNullish = (N ?? {}).from;
export const viaTernary = (c ? Outer : Map).groupBy([], f);
export const viaConstEnum = K || {};
for (const M of [E, Map]) use((M || Object).groupBy([], f));
export const viaIn = 'groupBy' in (N || Map);
export const { groupBy } = Outer || Map;
