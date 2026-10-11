import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global rewrites neither call: each loads the modules of the global its test reads, and a callee the
// build leaves as written stays the eval it was
const local = 1;
export const indirect = (typeof Symbol == 'undefined' ? install : eval)('typeof local');
export const direct = (typeof Map == 'undefined' ? install : String)(local);