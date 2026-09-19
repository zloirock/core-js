// a FULLY-consumed declarator whose receiver keeps its side effect inside a computed MEMBER key
// (`bag[(e++, 'A')]` resolves to the constructor through the const-object walk while the effect
// stays in the receiver text) beside a nested-proxy flatten sibling: the lifted init re-emits as
// a bare EXPRESSION statement, never dressed with the declaration keyword. a static-key member
// receiver has no retained effect and keeps the plain extraction route (control).
// sidecar: the text splice keeps the source's authored parens around the key sequence
// (`bag[(e++, 'A')]`), the AST reprint drops them - values identical
var bag = { A: Array };
var e = 0;
const { from: m1 } = bag[(e++, 'A')], { Array: { of2 } } = globalThis;
console.log(m1, of2, e);
const { isArray: m2 } = bag['A'], { Array: { of3 } } = globalThis;
console.log(m2, of3);
