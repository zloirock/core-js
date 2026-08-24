// Comments containing method-shaped text must remain intact - the rewrite scopes
// to AST nodes, not to comment text inside the source range
// arr.at(0) here is just text in the comment
const a = arr.at(-1);
/* arr.at(...) inside a block comment */
const b = arr.findLast(p);
