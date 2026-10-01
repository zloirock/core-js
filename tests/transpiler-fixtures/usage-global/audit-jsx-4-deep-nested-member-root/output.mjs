import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a 4-deep JSX member tag (`<Map.Foo.Bar.Baz>`) must walk all the way to the leftmost
// identifier so `Map` is recognised as the root global.
const elem = <Map.Foo.Bar.Baz value={x}>{children}</Map.Foo.Bar.Baz>;
export { elem };