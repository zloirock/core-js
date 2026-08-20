// for-in companion to `audit-destructure-for-of-left-bails`. for-in's left slot also holds a
// single VariableDeclaration with no init expression, and the flatten path requires a non-null
// declarator init, so it bails before the for-init check. confirms both for-of AND for-in left
// destructures stay verbatim.
const obj = {
  Array
};
for (const {
  Array: {
    from
  }
} in obj) {
  from([1]);
}