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
// usage-global twin: the computed string-literal ctor alias registers in the pre-pass, so
// the early member read through it injects its module like the plain form
function early() {
  return M.groupBy(['a'], x => x);
}
var {
  ['Map']: M
} = globalThis;
export const viaEarly = early();