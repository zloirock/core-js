// the factory's declared init is DEAD - `f0` is unconditionally reassigned before the alias read, so
// only `() => Map` reaches `f()`. the alias hop anchors its dominance check at the alias-read site, so
// the dead `() => Object` is excluded: only es.map.group-by injects, never es.object.group-by
let f0 = () => Object;
f0 = () => Map;
const f = f0;
f().groupBy(items, cb);
