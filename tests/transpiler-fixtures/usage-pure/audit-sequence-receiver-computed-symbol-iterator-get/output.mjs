import _getIterator from "@core-js/pure/actual/get-iterator";
// no-arg Symbol.iterator get-iterator with a comma-sequence receiver AND a side-effectful
// computed key. native evaluates the receiver before the key, so `first()` and `second()`
// (receiver) precede `third()` (key), each exactly once - the receiver is peeled to its tail
// and all three prefixes re-emit ahead of the get-iterator call.
const it = (first(), second(), third(), _getIterator(arr));