import _Array$from from "@core-js/pure/actual/array/from";
// A destructure property with a side-effecting computed key (`{ [(eff(), "from")]: x }`) evaluates the key
// at destructure time. When the property is removed during the static-extract rewrite, the key effect is
// folded into the emitted value so it still runs exactly once.
let keyEval = 0;
const build = (keyEval++, "from", _Array$from);
export const made = build([1]);