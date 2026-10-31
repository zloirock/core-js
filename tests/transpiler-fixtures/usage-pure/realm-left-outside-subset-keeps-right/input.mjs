// A `||` / `??` left naming a built-in the configured subset does not carry (`AsyncIterator` and `URL` in
// `es`) counts as no built-in: an engine lacking it runs the right, which keeps its mirror (`from`,
// `parse`). A built-in the subset carries still decides the selection (`Iterator.concat`).
const { from } = globalThis.AsyncIterator || Array;
const { parse } = globalThis.URL ?? JSON;
const { concat } = globalThis.Iterator || Array;
export { from, parse, concat };
