import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a chain written through a slot whose written value is a fresh LITERAL lands on that literal, where
// no built-in is reachable: the mutation census opens nothing for it, and a static's known return
// type keeps narrowing the instance read below
const cfg = {};
cfg.a = {};
cfg.a.b = 1;
export const last = _atMaybeArray(_ref = _Array$from(src)).call(_ref, -1);