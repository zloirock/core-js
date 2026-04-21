// `$&`, `$1`, `` $` ``, `$'` in user source — function-form `.replace(needle, () => inner)`
// in mergeEqualRange must pass through literally, not as a replacement-pattern directive
const y = x => x.at(`$& $1 $' $\` $$`);
