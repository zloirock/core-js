import _includes from "@core-js/pure/actual/instance/includes";
import _flat from "@core-js/pure/actual/instance/flat";
_includes(foo).apply(bar, [1, 2]);
_flat(foo).call(bar);
const fn = _flat(foo).bind(bar);