import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object rest excludes the original key. The iterator symbol is rewritten in the native pattern.
const [{
  [_Symbol$iterator]: se,
  ...seRest
}] = [effect()];
se;
seRest;
const chain = [arr];
const [{
  [_Symbol$iterator]: chained,
  ...chainRest
}] = chain;
chained;
chainRest;
const [, {
  [_Symbol$iterator]: holed,
  ...holeRest
}] = [0];
holed;
holeRest;