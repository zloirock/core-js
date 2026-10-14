// A realm key naming a built-in the build is told not to substitute still names it: the data subset carries
// `Iterator`, so the slot counts filled and the level's default is dead - it leaves, and the excluded static reads
// the raw slot (`from`). A key the filter keeps decides alike, its default leaving the mirror (`Map`).
const { Iterator: { from } = Array } = globalThis;
const { Map: { groupBy } = Object } = globalThis;
export { from, groupBy };
