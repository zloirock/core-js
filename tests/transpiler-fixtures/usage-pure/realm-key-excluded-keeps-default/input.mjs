// A realm key naming a built-in the build is told not to inject is an unknown slot: an engine lacking it
// takes the inner default, which keeps its mirror (`from`). A key the filter keeps still takes its default
// as dead (`Map`).
const { Iterator: { from } = Array } = globalThis;
const { Map: { groupBy } = Object } = globalThis;
export { from, groupBy };
