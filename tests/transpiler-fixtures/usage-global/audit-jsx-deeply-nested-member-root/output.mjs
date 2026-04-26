import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `<Map.Bar.Baz />` - 3-level JSXMemberExpression chain at the opening-element name slot.
// the root identifier `Map` is the runtime reference; the chain walks up via .object slots.
// without N-deep walk through JSXMemberExpression, depth-2+ namespace tags miss the polyfill
const elem = <Map.Bar.Baz value={x}>{children}</Map.Bar.Baz>;
export { elem };