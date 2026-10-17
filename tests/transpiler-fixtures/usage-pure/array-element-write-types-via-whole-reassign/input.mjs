// a dominating whole-binding reassign IS the value source - precision comes from the new init
let replaced = [[1], [2]];
replaced = [[9]];
export const viaWholeReassign = replaced[0].at(8);
