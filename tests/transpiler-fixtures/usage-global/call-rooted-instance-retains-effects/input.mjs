// Capturing a realm-producing call keeps its effects before both property reads.
function get() { effect(); return globalThis; }
const { Array: { prototype: { flat }, isArray } } = get();
export { flat, isArray };
