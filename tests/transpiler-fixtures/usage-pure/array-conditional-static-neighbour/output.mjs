import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref3, _ref4;
// The original conditional branch carries its static mirror.
// Capture evaluates that condition before either element binds its property.
const [_ref, _ref2] = [source, (effect(), pick) ? {
  from: _Array$from
} : other];
const at = _at(_ref);
const {
  from
} = _ref2;
let includes, of;
[_ref3, _ref4] = [second, (effect(), choose) ? {
  of: _Array$of
} : custom];
includes = _includes(_ref3);
({
  of
} = _ref4);
use(at, from, includes, of);