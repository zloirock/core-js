// An inline-resolvable call `(() => Array)(counter++)` folds to its returned receiver `Array` when the
// `in` probe resolves statically, but the call ARGUMENT runs at call time and would be lost. The purity
// probe inspects the arguments, so the side-effecting `counter++` rides along with the folded receiver.
let counter = 0;
export const has = "from" in (() => Array)(counter++);
