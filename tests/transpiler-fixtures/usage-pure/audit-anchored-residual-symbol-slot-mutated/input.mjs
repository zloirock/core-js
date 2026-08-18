// a SLOT-mutated `Symbol` (the file installs its own) is NOT the well-known symbols, so an anchored
// residual keeps the key on the user's object instead of re-keying it to the ponyfill - swapping it
// would read a slot their replacement never carries. the mutation deopts the name for the whole file,
// so this case cannot share a module with the pristine spellings.
globalThis.Symbol = Fake;
const { Map: { [Symbol.iterator]: kept }, Object: { fromEntries: fe } } = globalThis;
kept;
fe(x);
export { kept, fe };
