import _Array$from from "@core-js/pure/actual/array/from";
// per-branch synth on `LogicalExpression` (`||`) with TS-wrapped branches: `getFallbackBranchSlots`
// returns `['left', 'right']` for `||`. each slot must be peeled ahead of `registerPolyfill`
// otherwise apply()'s `t.isIdentifier(receiver)` invariant fails. mixed shapes (only one
// branch TS-wrapped) verify the peel applies independently per branch
const from = _Array$from;
from([1, 2]);