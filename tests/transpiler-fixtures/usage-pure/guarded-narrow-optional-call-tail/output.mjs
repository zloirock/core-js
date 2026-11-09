import _Array$from from "@core-js/pure/actual/array/from";
// An optional call in a captured constructor tail skips every following plain step.
export function read(c, list) {
  var _ref;
  return _ref = c ? Array : null, null == _ref ? void 0 : (_ref === Array ? _Array$from(list) : _ref.from(list)).foo?.().length;
}