import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// proxy-global nested flatten with TWO residual siblings, each default holding a DIFFERENT
// instance call. both residual defaults (`a` -> `[1].at(0)`, `b` -> `[2].flat()`) must be
// polyfilled in place; their rewrites remap independently into the rebuilt destructure text
// (each shifts only the text after it), and `from` is the flatten extraction
var from = _Array$from;
var {
  a = _atMaybeArray(_ref = [1]).call(_ref, 0),
  b = _flatMaybeArray(_ref2 = [2]).call(_ref2)
} = _globalThis;
from([3]);
a;
b;