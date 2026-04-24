// `k` is bound to `Symbol.iterator` (member expression), then used as left operand
// of `k in Array`. plugin must follow the binding through the init, recognize the
// symbol reference, and rewrite `k in Array` to the `isIterable(Array)` polyfill.
// `Symbol` appears only in `k`'s init, so it gets polyfilled there (once)
const k = Symbol.iterator;
k in Array;
