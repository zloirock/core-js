import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
_includes(foo).apply(bar, [1, 2]);
_flatMaybeArray(foo).call(bar);
const fn = _flatMaybeArray(foo).bind(bar);