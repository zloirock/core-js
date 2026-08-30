// a destructure whose init is MEMOIZED keeps extracting statics for the props AFTER the memo. this
// emitter mutates the host in place, so the memo replaces the init and later props resolve against a
// bare ref; without the constructor's name riding along, the first instance prop ended extraction and
// the remaining statics shipped as native reads off that ref.
// the memo also has to PRECEDE what the group already emitted: natively the init runs before the
// pattern binds anything, so a static extracted ahead of the memoizing prop may not be hoisted above
// the init's effects - an effect reading that binding sees TDZ in the source. two ways it slipped:
// the memo was planted at the host, landing after the extraction, and a group whose props had been
// spliced out read as a sole-prop one, which inlines the init into the surviving prop instead.
// the sidecar is where the two legs spell that ONE evaluation differently: babel lifts the prefix and
// reads the tail again, this leg keeps the ref it memoized. both run the effect once, in source order.
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";

const eff = () => {};

function arrayCtor() {
	return Array;
}

const _ref = arrayCtor();

export const name = _nameMaybeFunction(_ref);
export const of = _Array$of;

const _ref2 = (eff(), Array);

export const seqOf = _Array$of;
export const seqName = _nameMaybeFunction(_ref2);
export const seqFrom = _Array$from;

const _ref3 = (eff(), Array);

export const n2 = _nameMaybeFunction(_ref3);
export const o2 = _Array$of;
export const { length: l2 } = _ref3;

// NEGATIVE: an un-memoized bare constructor never lost them
export const bareName = _nameMaybeFunction(Array);

export const bareOf = _Array$of;

// NEGATIVE: a proxy-global member receiver already registered its constructor
const _ref4 = _globalThis.Array;

export const navName = _nameMaybeFunction(_ref4);
export const navOf = _Array$of;