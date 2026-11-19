function dfl(a = [1]) { return a; }
const viaDefaultOverridden = dfl(...[[2]]);
viaDefaultOverridden.findLast(Boolean);
export { viaDefaultOverridden };
