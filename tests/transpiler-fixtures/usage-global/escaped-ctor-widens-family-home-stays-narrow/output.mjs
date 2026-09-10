import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the boundary the escape decides, on two constructors whose namespace entry DOES add statics: the
// handed-out one owes them (nothing in this file can name what the consumer will read), the one
// only constructed here owes the constructor entry alone. both flavors answer it, through entry
// alphabets of their own - the namespace ponyfill there, the namespace entry's modules here
hand(globalThis.Map);
use(new Promise(r));