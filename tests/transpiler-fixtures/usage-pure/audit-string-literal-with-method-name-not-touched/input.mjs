// String literal `'.at('` happens to spell a method dispatch - the rewrite is bounded
// by AST nodes, so string content is never touched
const a = arr.at(-1);
const message = "calling .at(0) on the array";
const b = arr2.findLast(p);
