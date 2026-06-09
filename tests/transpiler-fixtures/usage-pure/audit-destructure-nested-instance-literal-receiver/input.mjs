// a nested instance method whose receiver is a side-effect-free LITERAL (`[1, [2]]`, not a bare
// Identifier). re-referencing it is safe - a fresh array of the SAME type yields the same native-vs-
// polyfill pick - so it polyfills like an Identifier receiver: `const m = _flatMaybeArray([1, [2]])` while
// the key stays renamed in place. on engines without native `flat` (IE 11) the native receiver-drop left
// `m` undefined; the polyfill now wins. a member (getter) / call receiver still bails (would re-fire)
const { y: { flat: m } } = { y: [1, [2]] };
