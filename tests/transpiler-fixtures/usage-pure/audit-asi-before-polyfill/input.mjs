// ASI: previous statement ends without `;`, next statement starts with a polyfill
// that rewrites the MemberExpression to `(_guard(...)?...)`. startsEnclosingStatement
// + canFuseWithOpenParen should prepend `;` so prior line doesn't fuse as a call.
const x = obj
x?.at(0)
