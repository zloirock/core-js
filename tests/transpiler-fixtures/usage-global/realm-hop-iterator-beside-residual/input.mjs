// A realm hop peels before an iterator capture reads its slot beside a residual.
let iterator, object;
({ globalThis: { Array: { prototype: { [Symbol.iterator]: iterator } }, Object: object } } = globalThis);
export { iterator, object };
