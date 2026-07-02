import _Array$from from "@core-js/pure/actual/array/from";
// bodyless slot at `IfStatement.alternate` (else branch). path.key === 'alternate'
// (not 'consequent'); same wrap-needs-applying because `listKey === undefined`. asserts
// the wrap-detector keys off listKey absence rather than a specific slot-key whitelist.
let from;
if (cond) skip();else from = _Array$from;
console.log(from);