import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
// An array capture evaluates the selecting constructor before either element binds its property.
// Pure instance leaves keep their own receivers; the supported conditional from branch still receives its polyfill.
const [, _ref] = [source, (effect(), pick) ? Array : other];
const at = _at(source);
const from = _ref === Array ? _Array$from : _ref.from;
let includes, of;
[, _ref2] = [second, (effect(), choose) ? Array : custom];
includes = _includes(second);
({
  of
} = _ref2);
use(at, from, includes, of);