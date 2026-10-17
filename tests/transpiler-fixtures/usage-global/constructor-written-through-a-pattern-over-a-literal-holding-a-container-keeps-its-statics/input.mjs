// a binding a pattern takes off a slot of a literal spelled in place that holds a container by name is that
// container - an array literal's, an object literal's - so a constructor written through it owes its family
// to a static read back through the container's own name
const listed = { C: Object };
const [viaArray] = [listed];
viaArray.C = Map;
export const grouped = listed.C.groupBy([1], x => x);
const spelled = { C: Object };
const { x: viaObject } = { x: spelled };
viaObject.C = Promise;
export const settled = spelled.C.allSettled([]);
