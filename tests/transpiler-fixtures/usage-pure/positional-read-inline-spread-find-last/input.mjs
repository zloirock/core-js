function dfl(a = [1]) { return a; }
const viaDefaultOverridden = dfl(...[[2]]);
viaDefaultOverridden.findLast(Boolean);
viaDefaultOverridden.at(0);
export { viaDefaultOverridden };
