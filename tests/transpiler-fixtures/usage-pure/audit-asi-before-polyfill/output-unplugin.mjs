import _at from "@core-js/pure/actual/instance/at";
// ASI: previous statement ends without `;`, next statement starts with a polyfill
// that rewrites the MemberExpression to `(_guard(...)?...)`. startsEnclosingStatement
// + canFuseWithOpenParen should prepend `;` so prior line doesn't fuse as a call.
const x = obj
x == null ? void 0 : _at(x).call(x, 0)