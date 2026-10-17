// the mutator's ARGUMENT type does not matter - a cross-family push retypes the elements
// exactly like a same-family one, and the later element read still bails to generic
const mixed = [[9]];
mixed.push("x");
export const viaCrossFamilyPush = mixed[0].at(0);
