import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// TSTypeOperator with `unique` operator wrapping symbol keyword. resolveTypeAnnotation's
// TSTypeOperator branch unwraps any operator except `keyof`. `unique symbol` should
// resolve to symbol primitive. Probe via array-of element narrowing - if the operator
// peels correctly, an array of unique symbols still narrows to Array dispatch.
declare const ks: (unique symbol)[];
_atMaybeArray(ks).call(ks, 0);
_findLastMaybeArray(ks).call(ks, x => true);