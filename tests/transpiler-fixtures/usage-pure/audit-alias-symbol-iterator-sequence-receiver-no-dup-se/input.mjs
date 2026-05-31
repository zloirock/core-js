// get-iterator where Symbol.iterator arrives via an ALIAS binding (`const S = Symbol.iterator;
// recv[S]()`) and the receiver is a comma-sequence. the alias key is a bare Identifier (no
// key-SE), so the only side effect is the receiver's `a()`, which must run EXACTLY ONCE - the
// receiver is peeled to its tail so its prefix isn't both passed through and prepended.
const S = Symbol.iterator;
let recv = [1, 2, 3];
const it = (a(), recv)[S]();
