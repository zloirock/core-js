// for-in companion to `audit-destructure-for-of-left-bails`. for-in's left slot also
// accepts a single VariableDeclaration with no init expression - `planDeclarator` gates
// on declarator.init being non-null, so the flatten path bails before reaching the
// `isForInit` check. confirms both for-of AND for-in left destructures stay verbatim
const obj = { Array };
for (const { Array: { from } } in obj) {
  from([1]);
}
