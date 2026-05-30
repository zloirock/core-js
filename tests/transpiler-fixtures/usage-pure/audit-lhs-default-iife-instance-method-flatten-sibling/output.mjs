import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const from = _Array$from;
// flatten extraction (`from` off `Array`) sharing a declarator with a preserved LHS-default
// key whose default is an IIFE running an instance method (`[1].at(0)`). the instance-method
// rewrite seeds a `var _ref;` body-wrap inside the IIFE body, which sits inside the preserved
// residue. the per-declarator ref drain must span the full declarator so that var lands in the
// IIFE body, never as a dangling insert inside the split-declarator overwrite
const {
  x = function () {
    var _ref;
    return _atMaybeArray(_ref = [1]).call(_ref, 0);
  }()
} = Array;
from([1]);