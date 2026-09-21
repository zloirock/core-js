// probe corpus of the defense cycles over the destructure wrappers, family "spread", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$freeze from "@core-js/pure/actual/object/freeze";

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
	const [, { Map: M }] = [...[0, { Map: _Map }]];

	new M();
}

{
	eff();

	const at = _atMaybeArray([1]);
}

{
	const [, { from: f }] = [...[0, { from: _Array$from }]];
}

{
	const [, { from: f }] = [...[0], pick ? { from: _Array$from } : userObj];
}

{
	const [[x]] = [...[[[1]]]];

	_atMaybeArray(x).call(x, 0);
}

{
	const at = _atMaybeArray([1, 2]);
}

{
	const at = _atMaybeArray([1, 2]);
}

{
	const [[{ from: f }]] = [...[[...[{ from: _Array$from }]]]];
}

{
	const [[{ from: f }]] = [...[[...[Object]]]];
}

{
	const [a = [1]] = [...[[2]]];

	_atMaybeArray(a).call(a, 0);
}

{
	const [a = [1]] = [...[undefined]];

	_atMaybeArray(a).call(a, 0);
}

{
	const [x] = [...[[1, 2]], eff()];

	_atMaybeArray(x).call(x, 0);
}

{
	const [x] = [...[[1]], ...rest];

	_atMaybeArray(x).call(x, 0);
}

{
	const [{ Map: M }] = [...[{ Map: _Map }]];

	new M();
}

{
	const [{ assign }] = [...[, Object]];
}

{
	const [_ref] = [...[, [1, 2]]];
	const at = _at(_ref);
}

{
	const [_ref2] = [...[, [1]]];
	const at = _at(_ref2);
}

{
	const _ref3 = [1, 2];

	eff();

	const at = _atMaybeArray(_ref3);
}

{
	const at = _atMaybeArray([1, 2]);
}

{
	const _ref4 = [1];

	eff();

	const at = _atMaybeArray(_ref4);
}

{
	const a = _atMaybeArray([1]);
}

{
	const [{ from: f }] = [...[{ from: _Array$from }]];
}

{
	const [{ from: f }] = [...[, Array]];
}

{
	const [{ from: f }] = [...[...[{ from: _Array$from }]]];
}

{
	const [{ from: f }] = [...[0, pick ? Array : userObj]];
}

{
	const [{ from: f }] = [...[0], Array];
}

{
	const [{ from: f }] = [...[{ from: _Array$from }, ...rest]];
}

{
	const [{ from: f }] = [...[{ from: _Array$from }]],
		[{ z }] = [...[nb]];
}

{
	const [{ from: f }] = [...[{ from: _Array$from }]];
}

{
	const [{ from: f }] = [...[]];
}

{
	const [{ from: f }] = [...[pick ? { from: _Array$from } : userObj]];
}

{
	var _ref5;
	const box = [1];
	const [, ...r] = [...[0, box]];

	_pushMaybeArray(_ref5 = r[0]).call(_ref5, 2);
	_atMaybeArray(box).call(box, 0);
}

{
	const box = [1];
	const [a] = [...[box]];

	_pushMaybeArray(a).call(a, 2);
	_atMaybeArray(box).call(box, 0);
}

{
	var _ref6, _ref7;
	const box = [[1]];
	const [, ...r] = [...[0, box]];

	_pushMaybeArray(_ref6 = r[0]).call(_ref6, 's');
	_at(_ref7 = box[0]).call(_ref7, 0);
}

{
	var _ref8;
	const box = [[1]];
	const [a] = [...[box]];

	_pushMaybeArray(a).call(a, 's');
	_at(_ref8 = box[0]).call(_ref8, 0);
}

{
	var _ref9;
	const o = { a: [...[[1]]] };

	_atMaybeArray(_ref9 = o.a[0]).call(_ref9, 0);
}

{
	const v = _Object$freeze(...[Array]);

	v.from([]);
}

{
	const v = _Object$freeze(...[[1, 2]]);

	_atMaybeArray(v).call(v, 0);
}