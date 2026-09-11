// a computed realm hop under a SEQUENCE-prefixed root: the `?.` below it tests the environment
// probe exactly as the dotted spelling does, and a prefix around the root is no reason to read that
// hop as always-defined. the descent to the root walked MEMBERS alone, so a sequence there read as
// "no proxy-global root at all", the probe test was dropped and the key's effect ran on the branch
// native short-circuits past - a divergence in the value AND in how many times the effect runs.
// the memo composes with that probe rather than testing its result again: the shared plan owns a
// SEQUENCE root too, since what it re-emits is the probe alone and the prefix rides inside it where
// the source runs it. ONE test stands on every row of both legs.
// the sidecar records what is left, and it is a SPELLING split on the first row alone: babel lands
// the whole nav in place there off a gate of its own, which erases the root's dead `?.` and memoizes
// the leaf, while the composition keeps the source's spelling and reads the leaf inline. same value,
// same effect counts in every realm. the landing may not simply stand down for the composition -
// where the composition declines a nav, that landing is what keeps the ponyfill in the memo
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

let c = 0;
const log = [];

export const seqRootComputedHop = null == (c++, _globalThis)?.window
	? void 0
	: _nameMaybeFunction((_pushMaybeArray(log).call(log, 'k'), _self).Array);

// the DOTTED twin, whose test the same descent already kept
export const seqRootDottedHop = null == (c++, _globalThis).window ? void 0 : _nameMaybeFunction(_self.Array);

// the BARE root, which the shared composition owns: one test, and the key effect rides the leaf
export const bareRootComputedHop = null == _globalThis.window
	? void 0
	: _nameMaybeFunction((_pushMaybeArray(log).call(log, 'k'), _self).Array);

export { c, log };