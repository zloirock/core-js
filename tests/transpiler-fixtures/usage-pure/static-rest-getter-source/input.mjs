// A retained getter runs once before the outer rest copy.
// Its proven static receives a fallback without replacing the source object.
let count = 0;
const source = { get w() { count++; return Array; }, extra: 7 };
let from, rest;
const held = ({ w: { from }, ...rest } = source);
export { count, from, rest };
console.log(held === source);
