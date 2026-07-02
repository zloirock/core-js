// an ArrayPattern that DIRECTLY wraps the instance pattern (`[{ flat: m }]`, no intervening object key). the
// receiver resolver walks the array INDEX to `arr`, and `const m = _flatMaybeArray(arr)` is extracted. `m` is
// the sole binding and the init `[arr]` is pure, so the dead residual destructure is dropped entirely. a
// multi-element wrapper (`[z, { flat: m }]`) keeps the destructure (sibling bindings survive); a spread bails
const arr = [1, [2]];
const [{ flat: m }] = [arr];
