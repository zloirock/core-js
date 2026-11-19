import _getIterator from "@core-js/pure/actual/get-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A Symbol.iterator alias selects an iterator method on a sequence receiver.
// The alias key adds no effect; the receiver prefix runs exactly once before the method read.
const S = _Symbol$iterator;
let recv = [1, 2, 3];
const it = _getIterator((a(), recv));