import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref;
// both HKT paths in one file: Wrap<Array, ...> via the Type-object lane (built-in F),
// Wrap<Boxed, ...> via the AST splice lane (user-alias F). distinct methods
// (.at vs .findLast) prove each line routes through its own lane independently
type Boxed<T> = { val: T };
type Wrap<F, X> = F<X>;
declare const a: Wrap<Array, string>;
declare const b: Wrap<Boxed, string[]>;
_atMaybeArray(a).call(a, 0);
_findLastMaybeArray(_ref = b.val).call(_ref, s => s.length > 0);