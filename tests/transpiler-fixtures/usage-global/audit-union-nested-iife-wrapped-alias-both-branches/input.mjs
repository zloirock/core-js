// the alias source is wrapped in NESTED zero-arg IIFEs (`const f = (() => (() => f0)())()`): the hop
// peels every wrapper layer to a fixpoint to reach f0, preserving BOTH its branches - the declared
// `() => Object` (c-false) and the reassigned `() => Map` (c-true) - so `f().groupBy` injects
// es.object.group-by AND es.map.group-by
let f0 = () => Object;
if (c) f0 = () => Map;
const f = (() => (() => f0)())();
f().groupBy(items, cb);
