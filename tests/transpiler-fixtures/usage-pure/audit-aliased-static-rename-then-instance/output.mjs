import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Aliased static `Array.from` is renamed twice through a chain of `const` aliases, then
// invoked; the call receiver must narrow back to Array through the deepest alias binding.
// When it fires, `at` and `includes` emit `_atMaybeArray` / `_includesMaybeArray`; on
// failure they fall back to `_at` / `_includes`. Distinct methods lock each line's dispatch
const arrayFromOriginal = _Array$from;
const arrayFromIntermediate = arrayFromOriginal;
const arrayFromFinal = arrayFromIntermediate;
const out1 = arrayFromFinal('abc');
const out2 = arrayFromFinal([1, 2, 3]);
_atMaybeArray(out1).call(out1, 0);
_includesMaybeArray(out2).call(out2, 2);