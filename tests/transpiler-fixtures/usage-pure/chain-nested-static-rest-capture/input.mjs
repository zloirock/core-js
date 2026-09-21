// A nested container remains the result of both assignments; each read is polyfilled.
let from, rest;
const source = { w: Array, extra: 1 };
const held = ({ w: { from }, ...rest } = ({ w: { from }, ...rest } = source));
use(held === source, from([1]), rest);
