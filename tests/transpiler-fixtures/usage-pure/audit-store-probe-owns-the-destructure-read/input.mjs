// a `?.` over a chain-assign STORE weighs the value the store hands on, not the write: the stored
// navigation can short-circuit, so the destructure init re-emits the read the fold would swallow
// and keeps the source's throw. the PLAIN twin beside it has no `?.` to weigh and folds whole
let v, w;
const ga = globalThis;
const { trunc } = (v = ga.window?.self)?.window.Math;
const { trunc: plainTwin } = (w = ga.window?.self).window.Math;
export { trunc, plainTwin, v, w };
