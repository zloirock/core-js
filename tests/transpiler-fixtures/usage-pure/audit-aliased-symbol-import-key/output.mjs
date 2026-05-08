import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _isIterable from "@core-js/pure/actual/is-iterable";
// User imports a Symbol entry from core-js/pure directly; both pipelines must
// recognise the well-known Symbol via `bindingSymbolKey` (importSource match) for
// the `in` check, and emit no separate Symbol polyfill. Babel goes through
// polyfillHint AND importSource; unplugin only via importSource. The detection
// must remain symmetric in spite of the polyfillHint asymmetry on the adapter.
import iter from "@core-js/pure/actual/symbol/iterator";
import async from "@core-js/pure/actual/symbol/async-iterator";
const isIter = _isIterable(target);
const isAsync = async in target;
_findMaybeArray(target).call(target, x => x);