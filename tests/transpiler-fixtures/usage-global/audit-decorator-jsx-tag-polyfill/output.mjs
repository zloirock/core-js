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
// JSX inside decorator expressions (`@(<Map/>) class C {}`). unplugin's decorator
// walker previously had no JSXIdentifier visitor, so embedded JSX tag-names did not
// trigger global polyfill emission. fix shares `jsxIdentifierVisitor` between the
// top-level visitor map and `decoratorVisitors` so both shapes find the same global
// runtime references. distinct decorator targets per class (simple JSXIdentifier
// `<Map/>` vs JSXMemberExpression root `<Set.X/>`) pin emission to each global.
@(<Map />)
class WithMap {}
@(<Set.X />)
class WithSetRoot {}