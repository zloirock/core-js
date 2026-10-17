import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// ... and the callee that hands the value straight back holds nothing at all: the call IS the
// argument, so the reference stays this file's own wherever the call itself does not leave
const identity = x => x;
use(_Number$isInteger);