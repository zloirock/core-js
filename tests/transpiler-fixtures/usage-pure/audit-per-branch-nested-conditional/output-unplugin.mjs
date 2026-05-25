import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// nested ConditionalExpression branches: outer slots are nested ternaries; per-branch
// synth-swap should recurse into inner branches so all leaf Identifiers get synth-swapped
// to their own polyfill object. without recursion, isViableBranchForKey rejects the
// inner ConditionalExpression at the outer level and the whole synth-swap bails
const { from: a } = cond ? (cond ? { from: _Array$from } : { from: _Iterator$from }) : (cond ? { from: _Iterator$from } : { from: _Array$from });
a([1]);