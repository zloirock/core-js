import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write through a conditional container alias may replace the matching slot of either arm.
const branchEscapeBothArms = function () {
  const armA = {
    k: Object
  };
  const armB = {
    k: Object
  };
  const picked = globalThis.cond ? armA : armB;
  picked.k = Map;
  const {
    k: {
      getOwnPropertyNames: fromA
    }
  } = armA;
  const {
    k: {
      getOwnPropertyDescriptor: fromB
    }
  } = armB;
  return [fromA, fromB];
}();
export { branchEscapeBothArms };