// Aliased static `Array.from` is renamed twice through a chain of `const` aliases, then
// invoked; the call receiver must narrow back to Array through the deepest alias binding.
// When it fires, `at` and `includes` emit `_atMaybeArray` / `_includesMaybeArray`; on
// failure they fall back to `_at` / `_includes`. Distinct methods lock each line's dispatch
const arrayFromOriginal = Array.from;
const arrayFromIntermediate = arrayFromOriginal;
const arrayFromFinal = arrayFromIntermediate;
const out1 = arrayFromFinal('abc');
const out2 = arrayFromFinal([1, 2, 3]);
out1.at(0);
out2.includes(2);
