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
// A selected assignment yields its stored realm navigation to the constructor read.
// The Map claim injects while the selection, write and navigation effect stay observable.
export function read(flag) {
  let held;
  let effects = 0;
  const Constructor = (flag ? held = (effects++, globalThis.self).window : globalThis).Map;
  return [Constructor, held, effects];
}