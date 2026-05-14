// WRAP_BODYLESS_SE on a multi-decl host: extracted destructure goes into a synthesized
// block (the bodyless `if` accepts only a single statement), but sibling declarators of
// the same `var` (`y = 1`) must come along. before the fix the whole VariableDeclaration
// was replaced with the block carrying only the extracted name - `var` still hoisted `y`
// globally but its initializer was dropped, leaving `export { ..., y }` consumers with
// `undefined`. block-bodied `if` cases (already correct) are not exercised here.
if (cond) var { from } = (sideEffect(), Array), y = 1;
export { from, y };
