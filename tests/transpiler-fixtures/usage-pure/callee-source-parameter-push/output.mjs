import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
(_pushMaybeArray(out) || 0).call(out, (C => _Array$from((_pushMaybeArray(effects).call(effects, "arg"), [3])))(Array));
r = out;
export { r, effects };