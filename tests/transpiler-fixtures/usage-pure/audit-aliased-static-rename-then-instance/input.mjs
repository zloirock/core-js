// Aliased static `Array.from` is renamed twice through a chain of `const` aliases, then
// invoked. The receiver of the call must narrow back to Array via the polyfill entry-path
// read on the deepest alias binding. `at` and `includes` are array prototype methods - if
// narrowing fires, both emit the array-specific `_atMaybeArray` / `_includesMaybeArray`;
// if it fails, both fall back to generic `_at` / `_includes`. The contrast is visible
// per import name. Distinct methods per result so each call line locks its own dispatch
const arrayFromOriginal = Array.from;
const arrayFromIntermediate = arrayFromOriginal;
const arrayFromFinal = arrayFromIntermediate;
const out1 = arrayFromFinal('abc');
const out2 = arrayFromFinal([1, 2, 3]);
out1.at(0);
out2.includes(2);
