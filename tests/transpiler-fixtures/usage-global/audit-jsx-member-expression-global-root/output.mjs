import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `<Map.Provider />` - JSXMemberExpression as tag-name. the root identifier `Map` is the
// runtime reference (the `.Provider` chain accesses a property on the global), so plugin
// polyfills it via side-effect import. without root detection the polyfill would be missed
const elem = <Map.Provider value={x}>{children}</Map.Provider>;
export { elem };