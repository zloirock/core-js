import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user-aliased global as constructor in NewExpression: `const A = Array; new A(...)`.
// `resolveNewExpressionType` calls `resolveGlobalName(callee)` -- previously bailed when
// the Identifier had a binding, so `new A()` resolved to `$Object(null)` and the
// downstream `arr.at(0)` fell to generic `_at` dispatch. fix walks the const-alias
// chain to the canonical global name, so `new A()` is recognised as `new Array()`,
// `arr` resolves as an Array instance, `.at(0)` dispatches the Array-specific helper.
const A = Array;
const arr = new A(1, 2, 3);
_atMaybeArray(arr).call(arr, 0);