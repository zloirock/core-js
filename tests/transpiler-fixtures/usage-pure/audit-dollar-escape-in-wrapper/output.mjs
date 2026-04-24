import _at from "@core-js/pure/actual/instance/at";
// `$&`, `$1`, `` $` ``, `$'` in user source must pass through the wrapper rewrite
// literally, without being interpreted as regex-replacement directives
const y = x => _at(x).call(x, `$& $1 $' $\` $$`);