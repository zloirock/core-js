import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `expr.method<T>(args)` - method call with explicit type arguments. The source between
// the member callee and `(` contains user TS syntax, so text-level call-arg slicing must
// skip past the `<...>` block before looking for the opening paren of the runtime args
const arr = [1, 2];
const a = _atMaybeArray(arr).call(arr, -1);