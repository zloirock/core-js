// bodyless `if` with a side effect on a multi-decl host: the extracted destructure goes into a
// synthesized block (a bodyless `if` accepts one statement), but sibling declarators of the same
// `var` (`y = 1`) must ride along. before the fix the whole VariableDeclaration was replaced with
// a block carrying only the extracted name, so `y`'s initializer dropped and `export { y }` saw undefined
if (cond) var { from } = (sideEffect(), Array), y = 1;
export { from, y };
