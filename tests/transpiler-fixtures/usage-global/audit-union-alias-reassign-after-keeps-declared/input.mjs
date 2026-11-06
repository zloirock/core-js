// `f` const-aliases the factory f0 BEFORE f0 is reassigned, so `f` permanently holds the declared
// `() => Object` - the later `f0 = () => Map` write is dead for `f`. the alias hop anchors its
// reassignment-dominance at the alias-read site, so the still-live declared init resolves (`f()` is
// Object) and only es.object.group-by injects, never es.map.group-by from the post-capture write
let f0 = () => Object;
const f = f0;
f0 = () => Map;
f().groupBy(items, cb);
