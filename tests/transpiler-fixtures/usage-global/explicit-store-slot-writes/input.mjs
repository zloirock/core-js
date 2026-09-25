// an explicit property store spelled on its namespace writes a container slot as an assignment does:
// a pattern read of the slot `Reflect.set` filled reaches its value
const bag = { b: Math };
Reflect.set(bag, 'b', Object);
const { b: viaSet } = bag;
export const grouped = viaSet.groupBy(src, x => x);
