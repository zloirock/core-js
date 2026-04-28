// `polyfillSiblingReceiverRefs` walks the preserved declarator's subtree looking for
// references to a flattened receiver name (`globalThis` here). pre-fix it matched any
// Identifier with the name regardless of context, silently rewriting method names,
// property keys, labels, and `MemberExpression.property` tails to the polyfill identifier
// (`class { _globalThis() {} }`, `({})._globalThis`, `_globalThis: while ... break _globalThis`).
// post-fix `isNonReferencePosition` filter rejects those slots; only true binding references
// (e.g. the trailing `ref = globalThis`) get rewritten
var { Array: { from } } = globalThis,
    cls = class { globalThis() { return 1; } },
    obj = { globalThis: 1 },
    member = ({}).globalThis,
    ref = globalThis;
from([1]);
cls;
obj;
member;
ref;
