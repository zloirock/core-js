// boundary: a variadic-only tuple `[...string[]]` has the rest as its sole (and last)
// element. positional indexing of any slot resolves to the rest's element type with no
// ambiguity - rest IS the last element, the bail trigger only fires for rest in earlier
// positions. narrowing must remain string-precise so the polyfill picks `_atMaybeString`
type Words = [...string[]];
declare const w: Words;
w[0].at(0);
