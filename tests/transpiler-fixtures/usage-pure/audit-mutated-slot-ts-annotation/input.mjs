// a TYPE-annotation position never re-routes through the mutated slot - only value reads do
globalThis.Map = function ShimMap() {};
const x: Map<string, number> = new Map();
export default x;
