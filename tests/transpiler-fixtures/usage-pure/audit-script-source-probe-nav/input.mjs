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
// the same call root carrying a polyfillable ARGUMENT: the guard text spells the call back, so the
// read inside it keeps its own rewrite. an emit that decides this by asking whether the call is
// REPLAYED as a side effect answers no here - the call has none - and drops that read on the floor
var callRootArg = cr(Promise).window?.self.scriptBox.list?.at(0);
// the literal-IIFE twin: the render rewrites the call, so a rescue decided by matching its output
// text against the source loses the same read - the two rows fail under opposite wrong answers
var iifeArg = (function () { return globalThis; })(Promise).window?.self.scriptBox.list?.at(0);
var assignRoot = (held = globalThis).window?.self.scriptBox.list?.at(0);
var a = [1];
a
;(globalThis.window?.self.scriptBox.list ?? []).forEach(function () {});
module.exports = { plainValue, dispatch, parenLayer, callRoot, callRootArg, iifeArg, assignRoot, held, a };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
var typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.scriptBox.list ? 0 : 1) != null
  && ['ab', 'cd'].at(0).includes('a');
module.exports.typedNarrowing = typedNarrowing;
