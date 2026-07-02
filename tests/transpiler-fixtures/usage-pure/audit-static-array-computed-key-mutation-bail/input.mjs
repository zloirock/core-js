// the static method is monkey-patched through a computed string-literal key
// (`Array["from"] = ...`), which mutates the same slot as `Array.from = ...`; the later
// `Array.from(...)` must therefore bail out of pure substitution and keep the user's patch
Array["from"] = function () { return []; };
Array.from([1, 2, 3]);
