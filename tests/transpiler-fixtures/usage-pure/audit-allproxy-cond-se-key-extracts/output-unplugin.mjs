// Both arms select supported pure realm bindings.
// The receiver is captured before the key effect and the method binding follows it.
import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

const cond = false;

const { Array: _ref } = cond ? _globalThis : _self,
	_ref2 = _ref,
	from = null == _ref2 ? _ref2[""] : (eff(), _Array$from);

typeof from;