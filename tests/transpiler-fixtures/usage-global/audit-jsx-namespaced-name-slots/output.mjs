import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
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
// A namespaced JSX name lowers to a single string - `<Symbol:x />` is the element type "Symbol:x",
// never the global - so NEITHER half of one references a binding, in a tag slot or an attribute
// slot, whatever its case. The last row is the control: the same globals in a bare tag and a member
// root do reference, so the file shows the boundary rather than an empty output.
export const nsTagNamespace = <Symbol:x y={1} />;
export const nsTagName = <ns:WeakRef y={2} />;
export const nsAttrNamespace = <Other URL:z={3} />;
export const nsAttrName = <Other z:AggregateError={4} />;
export const referenced = [<Map x={5} />, <Set.Sub y={6} />];