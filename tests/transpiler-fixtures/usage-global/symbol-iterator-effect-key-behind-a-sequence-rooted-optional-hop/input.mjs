// A computed Symbol.iterator key with an effect, called behind a `?.` over a sequence-rooted receiver and
// continued past the call, is detected like its effect-free twin: the lookup pulls the iterator modules.
// One form per fixture: every receiver form loads this same module set, so a second row would mask the first.
let n = 0;
(e(), box)?.items[(n++, Symbol.iterator)]().next();
