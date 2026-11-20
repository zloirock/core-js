import _includes from "@core-js/pure/actual/instance/includes";
import _values from "@core-js/pure/actual/instance/values";
// A positional var read in its own initializer stops the value walk.
// Neighbouring instance claims must not make transformation recurse.
var [, _ref] = [list, M];
var {
  a: v
} = list;
var values = _values(list);
var _ref2 = _ref === void 0 ? [] : _ref;
var includes = _includes(_ref2.inner);
var {
  k: M
} = _ref2;
consume(v, values, includes, M);