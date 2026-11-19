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
// usage-global class-static-receiver walk through a class wrapper's STATIC field. `Resolves.Map` resolves
// to the Map constructor, so the destructured `groupBy` (a Map STATIC) injects es.map.group-by - a bare
// `globalThis.Map` reference does NOT pull group-by, so its presence proves the walk resolved the receiver.
// a class binding is REASSIGNABLE, so when a reassignment DOMINATES the read (`Reassigned = { Object: {} }`
// before the destructure) the declared name no longer identifies the original static field - the walk bails
// and es.object.group-by is NOT injected. a reassignment-blind class arm would wrongly resolve Reassigned.Object
class Resolves {
  static Map = globalThis.Map;
}
const {
  Map: {
    groupBy
  }
} = Resolves;
class Reassigned {
  static Object = globalThis.Object;
}
Reassigned = {
  Object: {}
};
const {
  Object: {
    groupBy: objectGroupBy
  }
} = Reassigned;
export { groupBy, objectGroupBy };