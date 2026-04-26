import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// 4-level JSXMemberExpression chain at opening-element name slot: walk must traverse the
// whole `.object` chain to identify the leftmost identifier as the runtime root reference.
// regression check for the N-deep walk (depth-2+ shouldn't have a hardcoded ceiling)
const elem = <Map.Foo.Bar.Baz value={x}>{children}</Map.Foo.Bar.Baz>;
export { elem };