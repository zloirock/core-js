import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref2;
// A global inside a computed-key destructure receiver is substituted before the key runs.
// The literal is evaluated once, then the key effect precedes the instance-property read.
const _ref = [1, _Promise],
  m = null == _ref ? _ref[""] : (effectful(), _flatMaybeArray(_ref));
const probe = _atMaybeArray(_ref2 = [3]).call(_ref2, 0);