// The native realm root does not own the nested constructor claim.
const { Iterator: { prototype: { flatMap } } } = globalThis;
export { flatMap };
