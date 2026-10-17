import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Reading an alias of one constructor slot leaves a different constructor slot available.
const aliasLeakIsPairPrecise = function () {
  const twoSlots = {
    M: Map,
    P: Object
  };
  const aliasM = twoSlots.M;
  void aliasM;
  const {
    P: {
      keys
    }
  } = twoSlots;
  return keys;
}();
export { aliasLeakIsPairPrecise };