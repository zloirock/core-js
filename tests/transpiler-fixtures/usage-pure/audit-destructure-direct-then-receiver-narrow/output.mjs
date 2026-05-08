import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
// Direct destructure of `Array` - babel rewrites the destructure in place leaving a
// polyfill-binding entry for `from` (`array/from`). The unrewriten unplugin path
// resolves the same pair through the destructure binding shape. Subsequent calls of
// the alias must narrow their result to Array, and each downstream instance method
// locks the staticPairFrom* extractor.
const of = _Array$of;
const result1 = from('abc');
const result2 = of(1, 2);
_findLastMaybeArray(result1).call(result1, x => x);
_flatMaybeArray(result2).call(result2);