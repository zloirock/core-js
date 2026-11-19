// A stored realm source keeps its prefix and exposes iterator claims beside residual reads.
let iterator, object, held;
({ globalThis: { Array: { prototype: { [Symbol.iterator]: iterator } }, Object: object } } = (effect(), held = globalThis));
export { iterator, object, held };
