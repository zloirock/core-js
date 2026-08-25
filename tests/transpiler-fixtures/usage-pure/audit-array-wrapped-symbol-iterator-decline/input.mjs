// array-wrapped `[Symbol.iterator]` bindings whose receiver cannot be re-read: an element whose
// EVALUATION is observable memoizes into a leading ref, so the extraction and the residual read
// one evaluation (what native performs) and the polyfill lands; a const-chain wrapper hides the
// element behind another statement and a hole leaves the target undefined - both stay NATIVE
// (only the well-known-symbol key text is polyfilled there)
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
