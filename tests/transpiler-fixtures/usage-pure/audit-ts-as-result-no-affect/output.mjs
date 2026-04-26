import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Array$from from "@core-js/pure/actual/array/from";
// `(Map.groupBy(...) as any)` cast on a polyfilled call result: the cast does not
// affect rewriting - the inner call is still polyfilled.
_at(arr).call(arr, -1) as number;
_includes(arr).call(arr, 1) satisfies boolean;
_Array$from([1]) as any[];