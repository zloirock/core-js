// iterator-method ACCESS (no call): `const m = (r(), arr)[Symbol[(k(), 'iterator')]]`. lowers to
// a bare `_getIteratorMethod(arr)` whose sole argument is the receiver. native evaluates the
// receiver before the computed key, so `r()` then `k()` must each run once, in source order - the
// receiver is peeled to its tail and both prefixes prepend. (babel previously dropped `r()` here,
// peeling the receiver while collecting only the key-SE.)
let arr = [1, 2, 3];
const m = (r(), arr)[Symbol[(k(), 'iterator')]];
