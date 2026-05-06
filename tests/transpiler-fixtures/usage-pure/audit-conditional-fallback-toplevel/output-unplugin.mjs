import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// top-level destructure with ConditionalExpression receiver: `const { from } = cond ? Array : Set;`.
// per-branch synth-swap is intentionally skipped here (would break `_Set.from`); only
// function-param destructure triggers branch rewrites
const cond = Math.random() > 0.5;
const { from } = cond ? { from: _Array$from } : _Set;
export { from };