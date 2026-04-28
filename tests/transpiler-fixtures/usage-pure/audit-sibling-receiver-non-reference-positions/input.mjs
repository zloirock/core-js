// sibling-receiver rewrite walks the preserved declarator's subtree looking for true
// binding references to a flattened receiver name (`globalThis` here). The non-reference-
// position filter rejects method names, object property keys, labels, and
// `MemberExpression.property` tails - only the trailing `ref = globalThis` gets the
// polyfill identifier substitution
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
