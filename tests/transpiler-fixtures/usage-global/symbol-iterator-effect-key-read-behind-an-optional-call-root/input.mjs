// A computed Symbol.iterator key with an effect, read without a call behind a `?.` over a call result, is
// detected like its effect-free twin: the lookup pulls the iterator modules.
// One form per fixture: every receiver form loads this same module set, so a second row would mask the first.
let n = 0;
get()?.rows[(n++, Symbol.iterator)];
