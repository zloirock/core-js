// Nested leaves share a captured receiver with their remaining properties. A loop head uses
// declarators; an unbraced slot is braced. A shared declaration preserves both neighbours around a
// middle capture. An export whose only nested level keeps siblings still follows its existing
// native boundary.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";

const box = { y: [1, [2]] };

function effect() {
	return 1;
}

export const { y: { at: exported, other: exportedOther } } = box;

const bodyless = (function () {
	if (box) var _ref = box.y,
		at = _atMaybeArray(_ref),
		{ other } = _ref;

	return [at, other];
})();

const loopHead = (function () {
	for (var _ref2 = box.y,
		at = _atMaybeArray(_ref2),
		{ other } = _ref2,
		i = 0; i < 1; i++) ;

	return [at, other];
})();

const sharedDeclaration = (function () {
	var z = 1;
	const _ref3 = box.y;
	var at = _atMaybeArray(_ref3);
	var { other } = _ref3;

	return [z, at, other];
})();

const middleDeclarator = (function () {
	var z = 1,
		_ref4 = box.y,
		at = _atMaybeArray(_ref4),
		{ other } = _ref4,
		zTail = 2;

	return [z, at, other, zTail];
})();

export { bodyless, loopHead, sharedDeclaration, middleDeclarator };