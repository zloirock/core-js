import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const _ref = _globalThis.window?.Array,
  viaPartialConsume = null == _ref ? _ref[""] : _Array$of,
  {
    of: _unused,
    ...viaPartialRest
  } = _ref;
export { viaPartialConsume, viaPartialRest };