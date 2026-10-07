// A `||` / `??` left naming a built-in the build is told not to inject counts as no built-in: an engine
// lacking it runs the right, whose static keeps its module (`Array.from`). A static the filter keeps still
// claims off the left (`Iterator.concat`).
const { from } = globalThis.Iterator || Array;
const { concat } = globalThis.Iterator ?? Array;
export { from, concat };
