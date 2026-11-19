// A literal whose slots run effects keeps them, in order, in the residual: the claim nested under its realm
// slot reads the realm afresh once they ran, and the sibling binds from the residual.
const { w: { Array: { prototype: { at: m } }, x } } = { a: eff(), w: (hit(), globalThis) };
export { m, x };
