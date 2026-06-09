// a NESTED instance method destructured WITHOUT a side-effect key. the nested flatten resolves receivers
// by static-constructor descent, which doesn't apply to an instance receiver - so this is handled by the
// shared residual: the receiver is resolved by walking the RHS along the nesting key (`y` -> `arr`, a
// bare Identifier), and `const m = _flatMaybeArray(arr)` is extracted while the key stays renamed in
// place. a side-effect-free LITERAL receiver also polyfills (re-referenceable); a MEMBER (getter) / call
// receiver bails to native - re-referencing it would re-fire the side effect
const arr = [1, [2]];
const { y: { flat: m } } = { y: arr };
