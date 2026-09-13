// An effectful loop initializer observes the lexical binding before destructuring starts.
// The receiver evaluation must precede both the static and instance extractions.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";

const log = [];

function observe(read) {
	try {
		_pushMaybeArray(log).call(log, typeof read());
	} catch {
		_pushMaybeArray(log).call(log, 'tdz');
	}
}

let result;

for (const _ref = (observe(() => keys), _globalThis),
	keys = _Object$keys,
	at = _atMaybeArray(_ref.Array.prototype); !result; ) result = [keys, at];

let single;

for (const _unused = (observe(() => of), _globalThis),
	of = _Array$of; !single; ) single = of(1);

export { log, result, single };