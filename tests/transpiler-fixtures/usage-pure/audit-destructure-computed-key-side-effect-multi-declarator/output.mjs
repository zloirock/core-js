import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A computed static key shares its declaration with an earlier declarator. The key effect and the
// pure static binding stay in that declarator slot, before the following statement; the proven
// constructor receiver needs no capture.
const first = 1,
  from = (effectful(), _Array$from);
const probe = _includesMaybeArray(_ref = [1, 2]).call(_ref, 2);