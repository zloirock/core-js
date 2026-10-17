import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Object.assign installs the constructor into a retained slot.
// Its later static read needs the namespace entry.
const w = {
  k: Object
};
Object.assign(w, {
  k: Map
});
const result = typeof w.k.groupBy;