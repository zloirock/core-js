#!/usr/bin/env node
// a SCRIPT source emits its polyfill bindings as `require` calls rather than imports, and the
// prologue they must follow is a directive rather than an import list. the guard family rides that
// channel unchanged - including the absorbed paren layer and the roots whose effect the guard test
// carries - and a statement whose leading `;` protected an open paren keeps its own delimiter
'use strict';
var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _globalThis = require("@core-js/pure/actual/global-this");
var _at = require("@core-js/pure/actual/instance/at");
var _forEach = require("@core-js/pure/actual/instance/for-each");
var _Promise = require("@core-js/pure/actual/promise/constructor");
var _self = require("@core-js/pure/actual/self");
var _includesMaybeString = require("@core-js/pure/actual/string/instance/includes");
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
_globalThis.scriptBox = { list: ['ab', 'cd'], n: 7 };
var cr = function () { return _globalThis; };
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
var iifeArg = null == (_ref5 = null == (function () { return _globalThis; })(_Promise).window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref5).call(_ref5, 0);
var assignRoot = null == (_ref6 = null == (held = _globalThis).window ? void 0 : _self.scriptBox.list) ? void 0 : _at(_ref6).call(_ref6, 0);
var a = [1];
a
;_forEach(_ref7 = (null == _globalThis.window ? void 0 : _self.scriptBox.list) ?? []).call(_ref7, function () {});
module.exports = { plainValue, dispatch, parenLayer, callRoot, callRootArg, iifeArg, assignRoot, held, a };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
var typedNarrowing = _atMaybeArray(_ref8 = ['ab', 'cd']).call(_ref8, (null == _globalThis.window ? void 0 : _self.scriptBox.list) ? 0 : 1) != null
  && _includesMaybeString(_ref9 = _atMaybeArray(_ref10 = ['ab', 'cd']).call(_ref10, 0)).call(_ref9, 'a');
module.exports.typedNarrowing = typedNarrowing;