// Object rest excludes the original key. The iterator symbol is rewritten in the native pattern.
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
