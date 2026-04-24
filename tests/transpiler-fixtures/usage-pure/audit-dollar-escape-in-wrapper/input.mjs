// `$&`, `$1`, `` $` ``, `$'` in user source must pass through the wrapper rewrite
// literally, without being interpreted as regex-replacement directives
const y = x => x.at(`$& $1 $' $\` $$`);
