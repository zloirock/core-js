import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an ArrayPattern that DIRECTLY wraps the instance pattern (`[{ flat: m }]`, no intervening object key).
// the wrapper peels to the declarator, the receiver resolver walks the array INDEX to `arr`, and the same
// residual the object-key case uses extracts `const m = _flatMaybeArray(arr)` - the kept slot renames to a
// throwaway. a multi-element wrapper (`[z, { flat: m }]`) or a hole keeps its siblings; a spread bails
const arr = [1, [2]];
const m = _flatMaybeArray(arr);
const [{
  flat: _unused
}] = [arr];