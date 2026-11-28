import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
// Direct destructure of `Array` - babel rewrites the destructure in place leaving a
// polyfill-binding entry for `from` (`array/from`). The unplugin path
// resolves the same pair through the destructure binding shape. Subsequent calls of
// the alias must narrow their result to Array, and each downstream instance method
// locks the staticPairFrom* extractor.
const from = _Array$from;
const of = _Array$of;
const result1 = from('abc');
const result2 = of(1, 2);
_atMaybeArray(result1).call(result1, 0);
_includesMaybeArray(result2).call(result2, 2);