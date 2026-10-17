var _globalThis = require("@core-js/pure/actual/global-this");
var _at = require("@core-js/pure/actual/instance/at");
var _Promise = require("@core-js/pure/actual/promise/constructor");
var _self = require("@core-js/pure/actual/self");
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
_globalThis.scriptBox = {
  list: ['ab', 'cd'],
  n: 7
};
var cr = function () {
  return _globalThis;
};
var held;
var plainValue = null == _globalThis.window ? void 0 : _self.scriptBox.n;
var dispatch = null == (_ref = null == _globalThis.window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref).call(_ref, 0);
var parenLayer = null == (_ref2 = (null == _globalThis.window ? void 0 : _self.scriptBox).list) ? void 0 : _at(_ref2).call(_ref2, 0);
var callRoot = null == (_ref3 = null == cr().window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref3).call(_ref3, 0);
// the same call root carrying a polyfillable ARGUMENT: the guard text spells the call back, so the
// read inside it keeps its own rewrite. an emit that decides this by asking whether the call is
// REPLAYED as a side effect answers no here - the call has none - and drops that read on the floor
var callRootArg = null == (_ref4 = null == cr(_Promise).window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref4).call(_ref4, 0);
// the literal-IIFE twin: the render rewrites the call, so a rescue decided by matching its output
// text against the source loses the same read - the two rows fail under opposite wrong answers
var iifeArg = null == (_ref5 = null == function () {
  return _globalThis;
}(_Promise).window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref5).call(_ref5, 0);
var assignRoot = null == (_ref6 = null == (held = _globalThis).window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref6).call(_ref6, 0);
var a = [1];
module.exports = {
  plainValue,
  dispatch,
  parenLayer,
  callRoot,
  callRootArg,
  iifeArg,
  assignRoot,
  held,
  a
};