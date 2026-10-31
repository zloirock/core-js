import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Written slots contribute their reaching constructors to global static injection.
// Local aliases and wrappers do not release the whole constructor family.
// Pure keeps written slots native with their statics; a proven replacement drops the old guard.
const cw = {
  k: Object
};
cw.k = Map;
const {
  k: {
    groupBy: viaSlotWrite
  }
} = cw;
export { viaSlotWrite };