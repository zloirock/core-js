import _at from "@core-js/pure/actual/instance/at";
// The captured array binds its method before the following property is read.
export function read(obj) {
  var _ref, _ref2;
  let at, y;
  obj;
  ({
    list: _ref
  } = obj);
  [_ref2] = _ref;
  at = _at(_ref2);
  ({
    y
  } = obj);
  return [at, y];
}