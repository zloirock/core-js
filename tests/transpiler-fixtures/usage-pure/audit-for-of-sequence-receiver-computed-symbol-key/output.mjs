import _getIterator from "@core-js/pure/actual/get-iterator";
// for-of over a comma-sequence receiver whose computed Symbol.iterator key ALSO carries a
// side-effect prefix. native evaluates the receiver before the computed key, so `first()`
// (receiver) and `third()` (key) must each run exactly once, in source order, ahead of the
// get-iterator call - the receiver is peeled to its tail and both prefixes re-emit around it.
for (const x of (first(), third(), _getIterator(arr))) sink(x);