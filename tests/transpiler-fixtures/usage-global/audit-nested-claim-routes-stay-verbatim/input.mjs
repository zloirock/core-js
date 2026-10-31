// the nested-claim routes are a PURE-flavor emission: this flavor rewrites nothing, so every shape
// they reshape there stays verbatim here and only its module is injected. that is the negative half
// of those routes - a rewrite leaking into this flavor would edit code the user asked to keep
const box = { y: [1, [2]] };
const { y: { at, other } } = box;
const { y: { flat }, keep } = box;
const rows = [[1, [2]]];
const [{ findLast }] = rows;
export const r = [at, other, flat, keep, findLast];
