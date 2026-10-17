// A `||` / `??` left naming a built-in the build is told not to inject still counts as one: the data subset
// carries `Iterator`, so the right never runs and its static loads nothing (`Array.from`), each key claiming
// off the left - an excluded static loads nothing (`Iterator.from`), a kept one its module (`Iterator.concat`).
// A left the subset lacks at the mode (`AsyncIterator`) hands the claim to the right (`Array.of`).
const { from } = globalThis.Iterator || Array;
const { concat } = globalThis.Iterator ?? Array;
const { of } = globalThis.AsyncIterator || Array;
export { from, concat, of };
