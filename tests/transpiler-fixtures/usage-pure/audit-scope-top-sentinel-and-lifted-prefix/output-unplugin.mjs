// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";

var _ref, _ref2, _ref3, _ref4, _unused;
let aP, rP, oP;

for (const _ref7 = (
		(
			_ref = { Array: _ref2 } = _globalThis,
			(
				_ref3 = _ref2,
				{} = _ref3,
				aP = _Array$fromAsync,
				{ fromAsync: _unused, ...rP } = _ref3,
				_ref3
			),
			_ref
		),
		Object
	),
	isSealed = _Object$isSealed; !oP; ) oP = isSealed;

const recvA = getObj();
const gA = (_ref4 = _getIteratorMethod(recvA)) === void 0 ? null : _ref4;
let aQ, rQ, oQ;

for (const _ref8 = (
		{ Promise: { allSettled: aQ, ...rQ } } = { Promise: _Promise },
		Object
	),
	isFrozen = _Object$isFrozen; !oQ; ) oQ = isFrozen;

// the same pair inside a FUNCTION: push order, no family grouping
export function inFn() {
	var _ref5, _ref6;
	const recvB = getObj();
	const gB = (_ref5 = _getIteratorMethod(recvB)) === void 0 ? null : _ref5;
	let aR, rR, oR;

	for (const _ref9 = ({ Map: { groupBy: aR, ...rR } } = { Map: _Map }, Object),
		getPrototypeOf = _Object$getPrototypeOf; !oR; ) oR = getPrototypeOf;

	const recvC = getObj();
	const gC = (_ref6 = _getIteratorMethod(recvC)) === void 0 ? null : _ref6;

	return [gB, aR, rR, oR, gC];
}

// a buried re-anchored host whose SOURCE prefix the lift finally gives a statement slot
let customW, cw = 0;

cw++;
({ customW } = _Map);

export const entries = _Object$entries;

// ... and a kept WRITE is not one of those: the value it stored is what the pattern reads
let customX, wx;

({ customX } = (wx = _globalThis, _Map));

export const keys = _Object$keys;

// a chain-assignment RHS on a plain assignment host lifts the write and extracts off the value
let qS, itS;

qS = _globalThis;
itS = _getIteratorMethod(_Set);

export const r = [
	aP,
	rP,
	oP,
	gA,
	aQ,
	rQ,
	oQ,
	customW,
	cw,
	customX,
	wx,
	entries,
	keys,
	qS,
	itS
];