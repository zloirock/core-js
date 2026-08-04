#!/usr/bin/env node
// a SCRIPT source emits its polyfill bindings as `require` calls rather than imports, and the
// prologue they must follow is a directive rather than an import list. the guard family rides that
// channel unchanged - including the absorbed paren layer and the roots whose effect the guard test
// carries - and a statement whose leading `;` protected an open paren keeps its own delimiter
'use strict';
globalThis.scriptBox = { list: ['ab', 'cd'], n: 7 };
var cr = function () { return globalThis; };
var held;
var plainValue = globalThis.window?.self.scriptBox.n;
var dispatch = globalThis.window?.self.scriptBox.list?.at(0);
var parenLayer = (globalThis.window?.self.scriptBox).list?.at(0);
var callRoot = cr().window?.self.scriptBox.list?.at(0);
var assignRoot = (held = globalThis).window?.self.scriptBox.list?.at(0);
var a = [1];
a
;(globalThis.window?.self.scriptBox.list ?? []).forEach(function () {});
module.exports = { plainValue, dispatch, parenLayer, callRoot, assignRoot, held, a };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
var typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.scriptBox.list ? 0 : 1) != null
  && ['ab', 'cd'].at(0).includes('a');
module.exports.typedNarrowing = typedNarrowing;
