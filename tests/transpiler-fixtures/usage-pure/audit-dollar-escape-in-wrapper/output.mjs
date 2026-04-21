import _at from "@core-js/pure/actual/instance/at";
// `$&`, `$1`, `` $` ``, `$'` in user source — function-form `.replace(needle, () => inner)`
// in mergeEqualRange must pass through literally, not as a replacement-pattern directive
const y = x => _at(x).call(x, `$& $1 $' $\` $$`);