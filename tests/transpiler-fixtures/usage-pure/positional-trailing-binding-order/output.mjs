import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A method getter precedes later plain or rest binding writes.
// Earlier bindings stay native; each later binding uses its selected array value.
function read(rows) {
  var _ref, _ref2;
  let tail = 'old';
  let at;
  [_ref, _ref2] = rows;
  at = _at(_ref);
  tail = _ref2;
  return [at, tail];
}
function rest(rows) {
  const [_ref3, ..._ref4] = rows;
  const includes = _includes(_ref3);
  const tail = _ref4;
  return [includes, tail];
}
use(read, rest);