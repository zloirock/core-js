// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";

let pick = 1;
const c = 1;
const userObj = {};
const arr = [1, 2];
const nb = { y: arr };
const rest = [];
const more = {};
const wrapped = [Object];
const log = [];
const obj = {};
const rows = [];
const k = 'k';
let kw;
const nul = null;

function eff() {
	return Object;
}

function eff2() {}

function mark(t, v) {
	_pushMaybeArray(log).call(log, t);

	return v;
}

{
	for (const { a, w: { at: m } } = { a: g(), w: eff() }; ; ) use(a, m);
}

{
	for (const { at: m, z } = eff(); ; ) use(m, z);
}

{
	for (const _ref of [Object, Object]) {
		let entries = _ref === Object ? _Object$entries : _entries(_ref);

		entries;
	}
}

{
	for (const _ref2 of [Object]) {
		let entries = _ref2 === Object ? _Object$entries : _entries(_ref2);

		entries;
	}
}

{
	for (const { from } of [{ from: _Array$from }, { from: _Array$from }]) from;
}

{
	for (const { from } of [id(Array)]) _pushMaybeArray(log).call(log, from);
}

{
	for (const _ref3 of [{ w: [[1]] }]) {
		let { w: [{ at }] } = _ref3;

		at;
	}
}

{
	for (const { w: [{ is } = {}] } of [{ w: [{ is: _Object$is }] }]) is;
}

{
	for (const { w: [{ is }] } of [{ w: [{ is: _Object$is }] }, { w: [{ is: _Object$is }] }]) is;
}

{
	for (const _ref4 of [{ w: [Object] }, { w: [userObj] }]) {
		let { w: [{ is }] } = _ref4;

		is;
	}
}

{
	for (const { w: [{ is }] } of [{ w: [{ is: _Object$is }] }]) is;
}

{
	for (const _ref5 of [{ w: [c ? Object : userObj] }]) {
		let { w: [{ is }] } = _ref5;

		is;
	}
}

{
	for (const { w: [{ values }] } of [{ w: [{ values: _Object$values }] }]) values;
}

{
	for (const { w: { [(eff(), 'keys')]: k } } of [{ w: { keys: _Object$keys } }, { w: { keys: _Object$keys } }]) k;
}

{
	for (const { w: { [_Symbol$iterator]: it } } of [{ w: [1] }]) it;
}

{
	for (const _ref6 of [{ w: [1] }, { w: 's' }]) {
		let at = _at(_ref6.w);

		at;
	}
}

{
	for (const _ref7 of [{ w: [1] }, { w: [1] }]) {
		let at = _atMaybeArray(_ref7.w);

		at;
	}
}

{
	for (const _ref8 of [{ w: [1] }, { w: [2] }]) {
		let at = _atMaybeArray(_ref8.w);

		at;
	}
}

{
	for (const _ref9 of [{ w: [1] }]) {
		let at = _atMaybeArray(_ref9.w);

		at;
	}
}

{
	for (const _ref10 in obj) {
		let m = _at(_ref10.w);

		use(m);
	}
}

{
	for (const _ref11 = { w: [1, 2], z: 1 },
		m = _atMaybeArray(_ref11.w),
		{ z } = _ref11; ; ) use(m, z);
}

{
	for (const { w: { at: m }, z } = { w: eff(), z: 1 }; c; ) use(m, z);
}

{
	for (const { w: { at: m }, z } = { w: eff(), z: 1 }; ; ) use(m, z);
}

{
	for (const { w: { entries = null } } of [{ w: { entries: _Object$entries } }]) entries;
}

{
	for (const _ref12 in obj) {
		let entries = _entries(_ref12.w);

		entries;
	}
}

{
	for (const _ref13 of [{ w: _Map }]) {
		let { w: { entries } } = _ref13;

		entries;
	}
}

{
	for (const _ref15 of [{ w: Object }, _globalThis]) {
		let { w: _ref14 } = _ref15,
			entries = _ref14 === Object ? _Object$entries : _entries(_ref14);

		entries;
	}
}

{
	for (const { w: { entries } } of [
		{ w: { entries: _Object$entries } },
		{ w: { entries: _Object$entries } }
	]) entries;
}

{
	for (const _ref17 of [{ w: Object }, { w: userObj }]) {
		let { w: _ref16 } = _ref17,
			entries = _ref16 === Object ? _Object$entries : _entries(_ref16);

		entries;
	}
}

{
	for (const { w: { entries } } of [{ w: { entries: _Object$entries } }]) entries;
}

{
	for (const { w: { entries } } of [{ w: { entries: _Object$entries } }]) {
		entries = 1;
	}
}

{
	for (const _ref18 of [{ w: Object, at: 1 }, { w: Object, at: 2 }]) {
		let entries = _Object$entries;
		let { at } = _ref18;

		[entries, at];
	}
}

{
	for (const _ref19 of [{ w: Object, at: 1 }]) {
		let entries = _Object$entries;
		let { at } = _ref19;

		[entries, at];
	}
}

{
	for (const _ref20 of [{ w: Object, y: [1] }]) {
		let _ref21 = _ref20;
		let entries = _Object$entries;
		let at = _atMaybeArray(_ref21.y);

		[entries, at];
	}
}

{
	for (const { w: { entries }, z } of [{ w: { entries: _Object$entries }, z: 1 }]) [entries, z];
}

{
	for (const { w: { entries, is } } of [{ w: { entries: _Object$entries, is: _Object$is } }]) [entries, is];
}

{
	for (const _ref22 of [{ w: arr }]) {
		let flat = _flatMaybeArray(_ref22.w);

		flat;
	}
}

{
	for (const { w: { getOwnPropertyNames: g } } of [{ w: { getOwnPropertyNames: _Object$getOwnPropertyNames } }]) g;
}

{
	for (const { w: { is } } of [{ w: { is: _Object$is } }, { w: { is: _Object$is } }]) is;
}

{
	for (const _ref24 of [{ w: Object }, { w: 1 }]) {
		let { w: _ref23 } = _ref24,
			is = _ref23 === Object ? _Object$is : _ref23.is;

		is;
	}
}