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
import "core-js/modules/web.dom-collections.iterator";
// `<Map.Provider />` - a JSX member tag. the root `Map` is a runtime reference and is polyfilled as
// the receiver it is, but what the renderer is handed is the MEMBER read, not the root, so the tag
// owes no family for it - the answer its desugared twin `createElement(Map.Provider, props)` already
// gives, and one source may not read two ways. the negative is the BARE tag, on another global so
// its family cannot swallow the evidence above: there the component IS the root the renderer holds
const elem = <Map.Provider value={x}>{children}</Map.Provider>;
const bare = <Set value={x} />;
export { elem, bare };