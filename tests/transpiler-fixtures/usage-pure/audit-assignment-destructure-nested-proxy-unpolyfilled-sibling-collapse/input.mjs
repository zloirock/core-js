// assignment-destructure (not a VariableDeclarator) off a NESTED proxy-global member with one
// polyfilled key (`of`) and a retained sibling (`other`). the AssignmentExpression right slot is
// kept, so the intermediate `self` proxy hop must COLLAPSE to `_globalThis.Array`
let of, other;
({ of, other } = globalThis.self.Array);
of(1, 2);
console.log(other);
