// a `?.` over a chain-assign STORE weighs the value the store hands on, not the write: the stored
// navigation can short-circuit, so the destructure init re-emits the read the fold would swallow
// and keeps the source's throw. the PLAIN twin beside it stores the same short-circuiting value and
// re-emits the same read - what its missing `?.` changes is where the throw lands, not whether one
let v, w;
const ga = globalThis;
const { trunc } = (v = ga.window?.self)?.window.Math;
const { trunc: plainTwin } = (w = ga.window?.self).window.Math;
export { trunc, plainTwin, v, w };
