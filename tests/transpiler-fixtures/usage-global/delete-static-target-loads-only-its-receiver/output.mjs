import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `delete` names its target without reading it, so the static it removes takes nothing of its own:
// only what is read on the way there does - the receiver, with its constructor family, and a member
// standing below the target. a sequence around the member makes it a value the operator never names
delete Array.from;
delete Array['of'];
delete Object.groupBy;
delete Map.groupBy;
delete Promise?.allSettled;
delete Object.entries.name;
delete (0, Object.fromEntries);