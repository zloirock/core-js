import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.find";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    return this.slots.find(x => x);
  }
};
viaSpread.borrowed();