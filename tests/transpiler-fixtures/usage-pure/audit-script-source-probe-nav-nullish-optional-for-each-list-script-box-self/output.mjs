var _globalThis = require("@core-js/pure/actual/global-this");
var _forEach = require("@core-js/pure/actual/instance/for-each");
var _self = require("@core-js/pure/actual/self");
var _ref;
_globalThis.scriptBox = {
  list: ['ab', 'cd'],
  n: 7
};
_forEach(_ref = (null == _globalThis.window ? void 0 : _self.scriptBox.list) ?? []).call(_ref, function () {});