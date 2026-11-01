// The served function-name read precedes the excluded static.
// Reversing source siblings reverses their runtime reads as well.
const { Array: { name, from } } = globalThis;
use(from, name);
export {};
