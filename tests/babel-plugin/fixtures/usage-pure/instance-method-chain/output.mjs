import _includesInstanceProperty from "@core-js/pure/actual/instance/includes";
import _flatInstanceProperty from "@core-js/pure/actual/instance/flat";
_includesInstanceProperty(foo).apply(bar, [1, 2]);
_flatInstanceProperty(foo).call(bar);
const fn = _flatInstanceProperty(foo).bind(bar);