// bodyless slot at `IfStatement.alternate` (else branch). path.key === 'alternate'
// (not 'consequent'); same wrap-needs-applying because `listKey === undefined`. asserts
// the wrap-detector keys off listKey absence rather than a specific slot-key whitelist.
let from;
if (cond) skip(); else ({ Array: { from } } = globalThis);
console.log(from);
