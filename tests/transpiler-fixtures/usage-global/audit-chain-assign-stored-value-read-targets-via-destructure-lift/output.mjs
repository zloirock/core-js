import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.map.constructor.js";
import "<CWD>/packages/core-js/modules/es.map.species.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert-computed.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// a destructure HOST over the stored value: the lift replays the kept assignment through the
// same canon instead of freezing raw hops into what the binding stores
let k12;
export const viaDestructureLift = (() => {
  const {
    Map: M
  } = k12 = globalThis.self.window;
  return typeof M;
})();