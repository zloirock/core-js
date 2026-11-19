import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A retained unknown key must not turn a served constructor sibling into a native read.
// The remaining raw sibling reads the same receiver at its original position.
let key = 'Promise';
const {
  globalThis: {
    [key]: {
      prototype
    }
  },
  Map: M,
  missing
} = (key = 'Array', globalThis);
new M();