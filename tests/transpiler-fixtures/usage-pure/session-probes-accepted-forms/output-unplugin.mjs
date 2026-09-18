// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";

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
	for (const _ref3 of [[Object, [1]]]) {
		let [_ref, _ref2] = _ref3;
		let values = _values(_ref);
		let at = _atMaybeArray(_ref2);

		[values, at];
	}
}

{
	for (const _ref4 of [
		{
			w() {
				return Object;
			}
		},

		{
			w() {
				return Object;
			}
		}
	]) {
		let { w: { keys } } = _ref4;

		keys;
	}
}

{
	for (let [_ref5] = [r, eff()],
		_ref6 = _ref5,
		values = _values(_ref6.w),
		at = _at(_ref6.y); ; ) {
		[values, at];

		break;
	}
}

{
	const at = _atMaybeArray([1, 2]);
}

{
	const a = _atMaybeArray([1]);
	const [{ [(eff('k'), 'w')]: _unused }] = [{ w: [1] }];
}

{
	const [{}] = [[1, 2], ...rest];
	const at = _atMaybeArray([1, 2]);
}

{
	let zLead = 1;
	let values = _values(r.w);
	let at = _at(r.y);

	[zLead, values, at];
}

{
	const [{}] = [r, eff('n')];
	const values = _values(r.w);
	const at = _at(r.y);
	const zTail = 1;

	[values, at, zTail];
}

{
	const [{}] = [r, eff('n')];
	const values = _values(r.w);
	const at = _at(r.y);
	const zTail = eff('t');

	[values, at, zTail];
}

{
	const zLead = eff('lead');
	const [{}] = [r, eff('n')];
	const values = _values(r.w);
	const at = _at(r.y);

	[zLead, values, at];
}

{
	const { Array: { prototype: _ref7 } } = _globalThis,
		_ref8 = _ref7,
		a = null == _ref8 ? _ref8[""] : (eff('k2'), _atMaybeArray(_ref8));
}

{
	const { Array: { prototype: _ref9 } } = _globalThis,
		_ref10 = _ref9,
		a = null == _ref10 ? _ref10[""] : (eff('k2'), _atMaybeArray(_ref10));

	_pushMaybeArray(log).call(log, a.call([3], 0));
}

{
	const { Array: { prototype: { [(eff('k2'), 'at')]: a } }, ...r } = _globalThis;
}

{
	const _ref12 = { w: 'x' },
		{ [(eff(), 'w')]: _ref11 } = null == _ref12 ? _ref12[""] : _ref12,
		_ref13 = _ref11,
		a = null == _ref13 ? _ref13[""] : _atMaybeString(_ref13);
}

{
	const _ref15 = { w: 'str' },
		{ [(eff(), 'w')]: _ref14 } = null == _ref15 ? _ref15[""] : _ref15,
		_ref16 = _ref14,
		i3 = null == _ref16 ? _ref16[""] : _includesMaybeString(_ref16);
}

{
	const keys = _Object$keys;
}

{
	const F = _Array$from;
	const { z } = { w: _globalThis, z: 1 };

	F(z);
}

{
	const { w: { Map: m, keep }, ...rest } = { w: _globalThis, z: 1 };

	use(m, keep, rest);
}

{
	const { w: { at: m }, z } = { w: eff(), z: 1 };
	const k = _Object$keys;
	const { q } = { w: eff(), q: 1 };

	use(m, z, k, q);
}

{
	const k = _Object$keys;
	const { w: { at: m }, z } = { w: eff(), z: 1 };

	use(m, k, z);
}

{
	const { w: { includes: i4 }, ...r } = { w: 'str' };
}

{
	const _ref17 = { w: Object, y: [1] };
	const values = _Object$values;
	const at = _atMaybeArray(_ref17.y);

	[values, at];
}

{
	const f = (
		((x) => (_pushMaybeArray(log).call(log, 'x'), x))(Array),
		_Array$from
	);
}

{
	const at = _atMaybeArray([1, 2]);
}

{
	const at = _atMaybeArray([1, 2]);
}

{
	const andHop = _Object$keys;
	const { q: andQ } = { w: eff() && Object, q: 1 };

	[andHop, andQ];
}

{
	const splitFrom = _Array$from;
	const _ref18 = _Array$of;
	const splitBesideStatic = _nameMaybeFunction(_ref18);
	const { foo: splitFoo } = _ref18;

	[splitBesideStatic, splitFoo, splitFrom];
}

{
	var _ref20;

	const _ref19 = Array,
		{ junk: defaultJunk } = _ref19;

	const _ref21 = (_ref20 = _ref19.of) === void 0 ? {} : _ref20;
	const defaultName = _nameMaybeFunction(_ref21);
	const { foo: defaultFoo } = _ref21;

	[defaultJunk, defaultName, defaultFoo];
}

{
	const soleOrder = _nameMaybeFunction(_Array$of);
	const soleOrderFrom = _Array$from;

	[soleOrder, soleOrderFrom];
}

{
	const soleResidual = _nameMaybeFunction(_Array$of);
	const { junk: soleResidualJunk } = _globalThis.Array;

	[soleResidual, soleResidualJunk];
}

{
	const soleInstanceResidual = _atMaybeArray(_globalThis.Array.prototype);
	const { junk: soleInstanceJunk } = _globalThis.Array;

	[soleInstanceResidual, soleInstanceJunk];
}