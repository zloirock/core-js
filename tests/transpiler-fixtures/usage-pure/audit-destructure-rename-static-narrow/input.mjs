// Destructure with rename: `const { from: customFrom } = Array` then call must still
// narrow the result through the `staticPairFromDestructure` extractor's renamed-property
// branch. Distinct methods (at, findLast) confirm narrowing applies at each call site.
const { from: customFrom } = Array;
const arr = customFrom('xy');
arr.at(0);
arr.findLast(x => x);
