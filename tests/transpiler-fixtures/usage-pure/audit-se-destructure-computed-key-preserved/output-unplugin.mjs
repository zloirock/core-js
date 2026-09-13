// A destructure property with a side-effecting computed key (`{ [(eff(), "from")]: x }`) evaluates the key
// at destructure time. When the property is removed during the static-extract rewrite, the key effect is
// folded into the emitted value so it still runs exactly once.
import _Array$from from "@core-js/pure/actual/array/from";

let keyEval = 0;

const _ref = Array && Array,
	build = null == _ref ? _ref[""] : (keyEval++, _Array$from);

export const made = build([1]);