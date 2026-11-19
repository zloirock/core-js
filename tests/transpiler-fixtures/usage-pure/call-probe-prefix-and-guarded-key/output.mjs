import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A call-yield probe keeps its prefix before the guard and its key inside it.
// The same static import serves both emitters; the source call is evaluated once.
const read = () => _globalThis.window;
_pushMaybeArray(log).call(log, 'prefix'), null == read() ? void 0 : (_pushMaybeArray(log).call(log, 'key'), _Array$from((_pushMaybeArray(log).call(log, 'argument'), [7])));