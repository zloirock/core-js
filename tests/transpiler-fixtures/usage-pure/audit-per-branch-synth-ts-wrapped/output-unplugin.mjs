import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// per-branch synth: ConditionalExpression in destructure-receiver position with TS-wrapped
// branches must peel TS wrappers BEFORE registering each branch as a synth target. pre-fix
// `tryRegisterPerBranchSynth` registered the raw TSAsExpression-wrapped path; `apply` then
// bailed at `t.isIdentifier(receiver)` because the receiver was a TSAsExpression node.
// behavior was non-deterministic - `Iterator` branch happened to work because the sibling
// constructor-polyfill injection replaced the slot with a fresh Identifier, but the `Array`
// branch (no constructor-polyfill in usage-pure) stayed wrapped and bailed silently.
// post-fix `peelTransparentPath` strips both TS wrappers and `ParenthesizedExpression`
// before register, so each branch reaches `apply` as a peeled Identifier
const { from } = cond ? { from: _Array$from } : { from: _Iterator$from };
from([1, 2]);