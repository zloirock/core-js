// array-wrapped `[Symbol.iterator]` bindings whose receiver cannot be safely re-read stay
// NATIVE (only the well-known-symbol key text is polyfilled): a side-effecting init element
// would double-evaluate, a const-chain wrapper hides the element behind another statement,
// and a hole leaves the target element undefined
const [{ [Symbol.iterator]: se, ...seRest }] = [effect()];
se;
seRest;
const chain = [arr];
const [{ [Symbol.iterator]: chained, ...chainRest }] = chain;
chained;
chainRest;
const [, { [Symbol.iterator]: holed, ...holeRest }] = [0];
holed;
holeRest;
