// When the receiver value of the body-extracted binding (`b: [y()]`) ITSELF carries a side effect,
// re-emitting it for the body-extract would evaluate `y()` twice and pull it ahead of the sibling
// side effects (`x()` before, `z()` after). so the extract must BAIL: the destructure stays intact
// and the receiver literal runs once, keeping native order `x() -> y() -> z()`. trades the `at`
// polyfill for side-effect correctness - the same call babel declines here
function x() { return 1; }
function y() { return 2; }
function z() { return 3; }

const { a, b: { at }, c } = { a: [x()], b: [y()], c: [z()] };
export const out = [a, c, typeof at];
