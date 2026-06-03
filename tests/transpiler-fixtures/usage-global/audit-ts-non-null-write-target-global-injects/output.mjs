import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the write-position bail is usage-pure only (a frozen import cannot be the `||=` target). in
// usage-global there is no identifier rewrite, and the `||=` still reads `Map`, so the base
// `Map` constructor suite is injected as a side-effect import (over-injection is safe in global mode)
Map! ||= 1;