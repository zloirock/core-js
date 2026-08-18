import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a SLOT-mutated `Symbol` (the file installs its own) is NOT the well-known symbols, so an anchored
// residual keeps the key on the user's object instead of re-keying it to the ponyfill - swapping it
// would read a slot their replacement never carries. the mutation deopts the name for the whole file,
// so this case cannot share a module with the pristine spellings.
_globalThis.Symbol = Fake;
const {
  [Symbol.iterator]: kept
} = _Map;
const fe = _Object$fromEntries;
kept;
fe(x);
export { kept, fe };