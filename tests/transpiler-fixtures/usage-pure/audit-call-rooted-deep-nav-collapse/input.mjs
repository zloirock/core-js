// a deeper nav under a non-proxy leaf chain with a CALL root: the receiver plan's member
// recursion must reach the call-rooted collapse exactly like the identifier-rooted twin
// (`_globalThis.foo`), never leave the raw `.window` hop standing over the inlined call
typeof (() => globalThis)().window.foo[Symbol.iterator];
typeof (() => globalThis)().window.foo?.[Symbol.iterator];
typeof globalThis.window.foo?.[Symbol.iterator];
// boundary forms of the same collapse: an SE-bearing computed hop key keeps its effect as the
// collapsed base's prefix, and a computed user leaf keeps its own spelling over the folded base
let c = 0;
typeof (() => globalThis)()[(c++, 'window')].foo?.[Symbol.iterator];
typeof (() => globalThis)()[(c++, 'window')]['foo-bar']?.[Symbol.iterator];
