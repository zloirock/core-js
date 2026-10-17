import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write a later unconditional write overwrites before the read, or before a closure reading the name is even defined, installs
// nothing the read observes: in usage-global its constructor's static stays out.
let inClosure = null;
inClosure = Map;