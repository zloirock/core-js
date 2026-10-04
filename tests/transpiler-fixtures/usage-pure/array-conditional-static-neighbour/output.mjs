import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
// The original conditional branch carries its static mirror.
// Capture evaluates that condition before either element binds its property.
const [, _ref] = [source, (effect(), pick) ? {
  from: _Array$from
} : other];
const at = _at(source);
const {
  from
} = _ref;
let includes, of;
[, _ref2] = [second, (effect(), choose) ? {
  of: _Array$of
} : custom];
includes = _includes(second);
({
  of
} = _ref2);
use(at, from, includes, of);