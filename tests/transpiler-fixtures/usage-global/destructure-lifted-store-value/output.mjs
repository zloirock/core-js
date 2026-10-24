import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A destructure consumer owns the realm value held by its lifted store. A store in a
// discarded source prefix has no such consumer and retains the terminal environment probe.
let held,
  count = 0,
  Assigned;
const {
  Map: Declared
} = held = (count++, globalThis.self).window;
const declaredStore = held;
({
  Map: Assigned
} = held = (count++, globalThis.self).window);
const assignedStore = held;
const {
  Map: PrefixOnly
} = (held = (count++, globalThis.self).window, globalThis);
export { Declared, Assigned, PrefixOnly, declaredStore, assignedStore, held, count };