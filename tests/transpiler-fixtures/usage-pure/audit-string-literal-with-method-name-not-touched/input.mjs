// String literal `'.at('` happens to match what looks like an inner needle - text
// rewrite is bounded by AST ranges so the compose layer never touches the literal
const a = arr.at(-1);
const message = "calling .at(0) on the array";
const b = arr2.findLast(p);
