import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
// 3-deep JSXMemberExpression chain inside decorator (`@(<Map.A.B />) class C {}`).
// `jsxIdentifierVisitor` walks `.object` from the root Identifier through nested
// JSXMemberExpression hops until it lands on JSXOpeningElement.name - root global
// resolves to `Map` regardless of chain depth. Set chain on second class confirms
// depth-2 also works (per-class distinct global pins emission)
@(<Map.Foo.Bar />)
class WithMapRoot {}
@(<Set.X />)
class WithSetRoot {}