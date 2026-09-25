import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a binding reassigned to a selection of its own navs (`p = p && (p.a || p.b)`) folds each nav once
// per path: the union over its writes terminates and still names the constructor its init holds
let parent = Map;
while (parent = parent && (parent.assignedSlot || parent.parentNode || parent.host)) {
  if (parent.done) break;
}
parent.groupBy([], x => x);