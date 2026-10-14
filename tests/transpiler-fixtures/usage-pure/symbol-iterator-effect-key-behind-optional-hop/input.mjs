// A computed Symbol.iterator key with an effect, read behind a deeper `?.`, short-circuits with the
// chain: the guard tests the probe, and the alternate reads the receiver past it into a memo ahead
// of the key, so the key runs only off a present value and after the read it follows. A receiver
// sealed by parens reads plainly and hands the helper whatever it produced.
let n = 0;
box?.list[(n++, Symbol.iterator)]();
(e(), box)?.items[(n++, Symbol.iterator)]().next();
get()?.rows[(n++, Symbol.iterator)];
(box?.cells)[(n++, Symbol.iterator)]();
