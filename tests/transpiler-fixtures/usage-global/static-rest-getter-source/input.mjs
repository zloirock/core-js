// A retained getter runs once before the outer rest copy.
// Its proven static extracts off the hop the host pattern captures in place, rest beside it, and the
// assignment still yields the source object.
let count = 0;
const source = { get w() { count++; return Array; }, extra: 7 };
let from, rest;
const held = ({ w: { from }, ...rest } = source);
export { count, from, rest };
console.log(held === source);
