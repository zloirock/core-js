// a TYPE-annotation position is untouched either way; the mutated name deopts, so its value
// reads stay verbatim too - nothing in this file substitutes
globalThis.Map = function ShimMap() {};
const x: Map<string, number> = new Map();
export default x;
