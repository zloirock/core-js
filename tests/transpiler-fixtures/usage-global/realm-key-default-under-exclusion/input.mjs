// A realm key naming a built-in the build is told not to inject still names it: the data subset carries
// `Iterator`, so the slot counts filled and the level's default is dead - no `Array.from` module, nor one for
// the excluded `Iterator.from`. A key the filter keeps decides alike (`Map` - no `Object.groupBy` module).
const { Iterator: { from } = Array } = globalThis;
const { Map: { groupBy } = Object } = globalThis;
export { from, groupBy };
