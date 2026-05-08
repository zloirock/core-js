import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// AssignmentPattern in static destructure: `const { from = () => [] } = Array`. `Array`
// is non-nullable - default never fires - and `staticPairFromDestructure` peels
// AssignmentPattern.left so the binding shape resolves to (Array, from). receiver
// narrowing fires through the body-extract alias map even after babel rewrites the
// destructure to `const from = _Array$from === void 0 ? () => [] : _Array$from;`.
// distinct methods per line - `at` (multi-receiver, registry has generic variant),
// `findLast` / `copyWithin` (Array-only). all three narrow to array entries
const from = _Array$from === void 0 ? () => [] : _Array$from;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, p => p);
_copyWithinMaybeArray(arr).call(arr, 0, 1);