// usage-pure folds a computed-key destructure alias: `const k = "x"; const { [k]: A } = { x: Object }`
// resolves A to the global Object through the key canon, so the static call substitutes
const k = "x";
const { [k]: A } = { x: Object };
export const r = A.fromEntries([["a", 1]]);
