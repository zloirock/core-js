// iterator-method CALL WITH ARGS on a comma-sequence receiver whose computed Symbol.iterator
// key also carries a side-effect prefix. this lowers to the `.call` shape; the receiver-SE
// must precede the key-SE (source order), each exactly once, ahead of `_getIteratorMethod(recv)
// .call(recv, ...)` - the receiver is peeled and both prefixes prepend. `r()` then `k()`.
let recv = [1, 2, 3];
const it = (r(), recv)[Symbol[(k(), 'iterator')]](42);
