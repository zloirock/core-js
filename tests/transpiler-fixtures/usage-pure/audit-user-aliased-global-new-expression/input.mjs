// user-aliased global as constructor in NewExpression: `const A = Array; new A(...)`.
// new-expression type resolution once bailed when the callee Identifier had a binding, so
// `new A()` resolved to a bare object and `arr.at(0)` fell to generic `_at` dispatch.
// walking the const-alias chain to the canonical global recognises `new A()` as `new Array()`,
// so `arr` is an Array instance and `.at(0)` dispatches the Array-specific helper.
const A = Array;
const arr = new A(1, 2, 3);
arr.at(0);
