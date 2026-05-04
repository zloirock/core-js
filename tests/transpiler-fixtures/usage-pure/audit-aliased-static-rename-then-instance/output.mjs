import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Aliased static `Array.from` is renamed twice through a chain of `const` aliases, then
// invoked. The receiver of the call must narrow back to Array via the polyfill entry-path
// read on the deepest alias binding. `at` and `includes` are array prototype methods - if
// narrowing fires, both emit the array-specific `_atMaybeArray` / `_includesMaybeArray`;
// if it fails, both fall back to generic `_at` / `_includes`. The contrast is visible
// per import name. Distinct methods per result so each call line locks its own dispatch
const arrayFromOriginal = _Array$from;
const arrayFromIntermediate = arrayFromOriginal;
const arrayFromFinal = arrayFromIntermediate;
const out1 = arrayFromFinal('abc');
const out2 = arrayFromFinal([1, 2, 3]);
_atMaybeArray(out1).call(out1, 0);
_includesMaybeArray(out2).call(out2, 2);