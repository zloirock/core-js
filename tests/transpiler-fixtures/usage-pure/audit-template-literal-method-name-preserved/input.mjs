// Template-literal interpolation - arr.at would be inside the literal but its
// substring nearly matches needle. AST visit isolates emission to the actual call expr
const log = `result ${ arr.at(0) }`;
const note = `arr.at(0) is the literal text here`;
const b = arr.findLast(p);
