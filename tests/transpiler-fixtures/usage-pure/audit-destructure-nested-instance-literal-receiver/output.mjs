import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested instance method whose receiver is a side-effect-free LITERAL (`[1, [2]]`, not a bare Identifier).
// `m` is the only binding and the init is pure, so the residual destructure is dead and dropped: the literal
// is emitted ONCE inside `_flatMaybeArray([1, [2]])` instead of being duplicated into a discarded residual.
// re-referencing such a literal is safe - a fresh array of the SAME type yields the same native-vs-polyfill
// pick. a member (getter) / call receiver still bails (would re-fire the side effect)
const m = _flatMaybeArray([1, [2]]);