import _globalThis from "@core-js/pure/actual/global-this";
import _forEach from "@core-js/pure/actual/instance/for-each";
import _self from "@core-js/pure/actual/self";

var _ref;

_globalThis.scriptBox = { list: ['ab', 'cd'], n: 7 };
_forEach(_ref = (null == _globalThis.window ? void 0 : _self.scriptBox.list) ?? []).call(_ref, function () {});