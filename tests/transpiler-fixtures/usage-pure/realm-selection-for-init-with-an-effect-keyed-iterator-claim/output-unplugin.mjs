// An iterator claim keyed by an effect beside a plain slot, in a for-init over a realm selection: both legs
// run the key's effect first and bind the claim after the slot, babel reading the realm again for each part
// while unplugin's drain memoizes it (the sidecar).
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";

for (const _ref = _globalThis,
	{ [(e(), _Symbol$iterator)]: _unused, z } = _ref,
	it = _getIteratorMethod(_ref); ; ) break;