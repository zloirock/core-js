import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _values from "@core-js/pure/actual/instance/values";
import _Object$values from "@core-js/pure/actual/object/values";
// Earlier instance reads and a retained guard share one capture of an effectful receiver.
// The call stays before both property reads and is never replaced with a repeated call.
let name, values;
const _ref = receiver() || Object;
name = _nameMaybeFunction(_ref);
values = _ref === Object ? _Object$values : _values(_ref);
use(name, values);