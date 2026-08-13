import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `expr.method<T>(args)` - method call with explicit type arguments. The source between
// the member callee and `(` contains user TS syntax, so text-level call-arg slicing must
// skip past the `<...>` block before looking for the opening paren of the runtime args
const arr = [1, 2];
const a = _atMaybeArray(arr).call(arr, -1);

// the same skip decides ARITY: a list holding only trivia is zero-arg, and a separator ahead of it
// would end the call in a comma - a parse error for the whole module on this method's ES5 baseline
const b = _atMaybeArray(arr).call(arr) /* index */;
const c = _atMaybeArray(arr).call(arr);
const d = _atMaybeArray(arr)?.call(arr) /* index */;