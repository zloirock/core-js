import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
try {
  const {
    groupBy: {
      length
    }
  } = (effects.push("source"), (globalThis.window?.self).Map);
  r = length;
} catch (error) {
  r = error.name;
}