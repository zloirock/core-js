var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _globalThis = require("@core-js/pure/actual/global-this");
var _self = require("@core-js/pure/actual/self");
var _includesMaybeString = require("@core-js/pure/actual/string/instance/includes");
var _ref, _ref2, _ref3;
_globalThis.scriptBox = {
  list: ['ab', 'cd'],
  n: 7
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
var typedNarrowing = (_atMaybeArray(_ref = ['ab', 'cd']) || 0).call(_ref, (null == _globalThis.window ? void 0 : _self.scriptBox.list) ? 0 : 1) != null && _includesMaybeString(_ref2 = _atMaybeArray(_ref3 = ['ab', 'cd']).call(_ref3, 0)).call(_ref2, 'a');
module.exports.typedNarrowing = typedNarrowing;