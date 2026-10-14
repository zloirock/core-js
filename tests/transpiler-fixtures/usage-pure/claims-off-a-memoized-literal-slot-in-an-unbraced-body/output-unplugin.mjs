// Several claims beside a nested pattern, in an object literal whose slot is memoized, as the first of the
// declarators an unbraced body holds: the memo leads the declaration as a declarator of its own, and each
// claim binds right after the residual, in the order the source wrote them - two under an `if`, three under
// a `while`, a defaulted one among two under a `for`. Unplugin's drains bind them ahead of it (the sidecar).
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";

var _ref3;

if (a) var _ref = box.y,
	at = _at(_ref),
	includes = _includes(_ref),
	{ y: { other: { q }, at: _unused, includes: _unused2 } } = { y: _ref },
	x1 = 1;

while (b) var _ref2 = box.z,
	flat = _flatMaybeArray(_ref2),
	fill = _fillMaybeArray(_ref2),
	find = _findMaybeArray(_ref2),
	{
		y: { more: { r }, flat: _unused3, fill: _unused4, find: _unused5 }
	} = { y: _ref2 },
	x2 = 2;

for (; ; ) var _ref4 = box.w,
	findLast = (_ref3 = _findLastMaybeArray(_ref4)) === void 0 ? null : _ref3,
	keys = _keys(_ref4),
	{ y: { last: { t }, findLast: _unused6, keys: _unused7 } } = { y: _ref4 },
	x3 = 3;

use(q, at, includes, x1, r, flat, fill, find, x2, t, findLast, keys, x3);