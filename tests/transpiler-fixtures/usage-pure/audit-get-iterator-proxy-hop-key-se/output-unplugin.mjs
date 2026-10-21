// Iterator consumption retains receiver and symbol-key order, optional lookup and sealed-call throws.
// Effectful realm keys remain in the receiver access.
import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";

var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;

const a = (
	_ref = _globalThis[(hop(), 'self')],
	key(),
	_getIterator(_ref)
);

const b = _getIterator(_globalThis[(probe(), 'self')]);

const c = (
	null == (_ref2 = _globalThis[(mark(), 'self')]) ? void 0 : (tag(), void 0),
	_getIterator(_ref2)
);

const d = _globalThis == null
	? void 0
	: (
		_ref3 = _globalThis[(hop2(), 'self')].window,
		key2(),
		_getIterator(_ref3)
	);

const e = _globalThis == null
	? void 0
	: (
		_ref4 = _globalThis[(hop3(), 'self')].window.self,
		key3(),
		_getIterator(_ref4)
	);

const f = (
	_ref5 = _globalThis[(hop4(), 'self')].window,
	key4(),
	_getIterator(_ref5)
);

const g = (
	_ref6 = (eff5(), _globalThis[(hop5(), 'self')]).window,
	key5(),
	_getIterator(_ref6)
);