// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";

const log = [];

let from,
	rest,
	keyed,
	other,
	nested,
	sibling,
	kw,
	prefixed;

if (log.length >= 0) ({ from, ...rest } = Array);

// A computed key runs before its property read and before the following sibling read.
if (log.length >= 0) {
	var _ref;

	(
		_ref = [3, [7]],
		null == _ref
			? _ref[""]
			: (
				(
					_pushMaybeArray(log).call(log, "k"),
					keyed = _atMaybeArray(_ref)
				)
			),
		{ other } = _ref,
		_ref
	);
}

if (log.length >= 0) {
	({ sibling } = _globalThis);
	nested = _Map$groupBy;
}

// A receiver prefix keeps its own inner polyfills and executes once before the binding.
if (log.length >= 0) {
	kw = (_pushMaybeArray(log).call(log, "e"), _globalThis);
	prefixed = _flatMaybeArray(_globalThis.Array.prototype);
}

// An array wrapper with a stored receiver remains conditional: its store and instance read
// must not run when the control condition is false.
let kwWrap, wrapped;

if (log.length < 0) {
	[kwWrap = _globalThis];
	wrapped = _withMaybeArray(_globalThis.Array.prototype);
}

export {
	from,
	rest,
	keyed,
	other,
	nested,
	sibling,
	kw,
	prefixed,
	kwWrap,
	wrapped,
	log
};