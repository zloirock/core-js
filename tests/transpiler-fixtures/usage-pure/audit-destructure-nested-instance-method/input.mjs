// a NESTED instance method destructured WITHOUT a side-effect key. the receiver is resolved by walking the
// RHS along the nesting key (`y` -> `arr`, a bare Identifier), and `const m = _flatMaybeArray(arr)` is
// extracted. since `m` is the declaration's ONLY binding and the init `{ y: arr }` has no side effect, the
// residual destructure binds nothing observable - it is dropped entirely, leaving just the extract. a MEMBER
// (getter) / call receiver still bails to native - re-referencing it would re-fire the side effect
const arr = [1, [2]];
const { y: { flat: m } } = { y: arr };
