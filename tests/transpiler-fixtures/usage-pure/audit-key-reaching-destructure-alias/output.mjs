import _Array$from from "@core-js/pure/actual/array/from";
// the computed key is reassigned through a destructure whose rhs is a const array (`[K] = karr`,
// karr = ["from"]); the dominating reaching write resolves the key through the same binding canon,
// so the static folds to the pure polyfill keyed by the reaching value, not the dead init
let K = "of";
const karr = ["from"];
[K] = karr;
export const r = _Array$from([1, 2]);