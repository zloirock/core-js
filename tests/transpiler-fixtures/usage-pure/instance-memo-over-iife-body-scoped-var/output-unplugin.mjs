import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref3;
// an instance-method memo (the outer `.at`) wraps an IIFE whose body hosts another instance
// method needing its own block-scoped `var _ref;`. that scoped var must compose into the
// enclosing memo overwrite, not be emitted as a raw insert inside it (MagicString can't fold an
// insert into an overwritten chunk). covers both the function-IIFE and arrow-IIFE block bodies
_atMaybeArray(_ref = (function () { var _ref2; _atMaybeArray(_ref2 = [9]).call(_ref2, 0); return [1]; })()).call(_ref, 0);
_atMaybeArray(_ref3 = (() => { var _ref4; _atMaybeArray(_ref4 = [3]).call(_ref4, 0); return [2]; })()).call(_ref3, 0);