import _getIterator from "@core-js/pure/actual/get-iterator";
// A no-arg Symbol.iterator call lowers to a bare get-iterator that takes the receiver
// verbatim as its only argument. When the receiver is a comma-sequence and the computed
// key also carries a side-effect prefix, both prefixes must survive - the receiver's own
// leading effects must not be peeled away while re-emitting only the key's effects.
const it = (third(), _getIterator((first(), second(), arr)));