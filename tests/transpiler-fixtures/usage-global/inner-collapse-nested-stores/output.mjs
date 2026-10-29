import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A nested store remains one expression below the realm navigation.
// Prefixes and the setter run once; an absent window skips the argument.
const log = [];
let inner, stored;
const holder = {
  set value(value) {
    log.push('set');
    stored = value;
  }
};
const result = (log.push('before'), holder.value = (log.push('between'), inner = (log.push('inside'), globalThis.self))).window?.Array.from((log.push('argument'), [7]));
consume(result, inner, stored, log);