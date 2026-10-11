import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an enum or a namespace binds a runtime object no binding view carries a declarator for: read as an
// operand of a selection, a for-of element, an `in` test or a destructure it is the user's own value, never
// a container literal that always yields, so the built-in beside it loads its static, one per row. a const
// enum read as a value is a TypeScript error the parsers and the transform still accept
enum E {
  A,
  from = 2
}
const enum K {
  A
}
namespace N {
  export const from = 1;
}
namespace Outer.Inner {
  export const from = 1;
}
export const viaOr = (E || Promise).allSettled([]);
export const viaNullish = (N ?? Math).trunc;
export const viaTernary = (c ? Outer : Array).of(1);
export const viaConstEnum = K || {};
for (const M of [E, Map]) use((M || Object).groupBy([], f));
export const viaIn = 'isInteger' in (N || Number);
export const {
  fromCodePoint
} = Outer || String;