// for-of over a comma-sequence receiver whose computed key also carries a side-effect
// prefix. A no-arg Symbol.iterator call lowers to a bare get-iterator that takes the
// receiver verbatim as its only argument; the incoming side effects carry only the key's
// prefix, not the receiver's own. The receiver's leading effect must survive inside the
// passed-through sequence while the key's effect is re-emitted around the call - both
// `first()` and `third()` must run, and in source order, when the loop iterates.
for (const x of (first(), arr)[Symbol[(third(), 'iterator')]]()) sink(x);
