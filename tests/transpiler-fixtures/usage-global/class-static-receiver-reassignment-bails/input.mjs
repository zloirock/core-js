// usage-global class-static-receiver walk through a class wrapper's STATIC field. `Resolves.Map` resolves
// to the Map constructor, so the destructured `groupBy` (a Map STATIC) injects es.map.group-by - a bare
// `globalThis.Map` reference does NOT pull group-by, so its presence proves the walk resolved the receiver.
// a class binding is REASSIGNABLE, so when a reassignment DOMINATES the read (`Reassigned = { Object: {} }`
// before the destructure) the declared name no longer identifies the original static field - the walk bails
// and es.object.group-by is NOT injected. a reassignment-blind class arm would wrongly resolve Reassigned.Object
class Resolves { static Map = globalThis.Map }
const { Map: { groupBy } } = Resolves;

class Reassigned { static Object = globalThis.Object }
Reassigned = { Object: {} };
const { Object: { groupBy: objectGroupBy } } = Reassigned;

export { groupBy, objectGroupBy };
