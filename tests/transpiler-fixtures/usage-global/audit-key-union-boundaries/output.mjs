import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.values";
import "core-js/modules/es.array.with";
// boundary forms of the reachable-key union, every branch a polyfillable method so each line's
// import-set is observable. positives: the alias resolves through an SE prefix (peeled to the
// tail before enumeration), through a const alias-of-alias hop, and on an optional member read.
// negatives: a DOMINATING reassignment kills the init branch (the dead init must NOT inject,
// the live value must); a branch reaching `prototype` is skipped; a branch spelling a
// well-known symbol as a string resolves no polyfill; a user-PATCHED static still injects
// (over-inject-safe - the patch wins at runtime through module order)
const arr = [1, 2];
let seKey = 'entries';
if (c) seKey = 'keys';
let effects = 0;
export const viaSePrefix = arr[effects++, seKey];
let hopSource = 'values';
if (c) hopSource = 'copyWithin';
const hopAlias = hopSource;
export const viaAliasHop = arr[hopAlias];
let optKey = 'find';
if (c) optKey = 'findIndex';
export const viaOptional = arr?.[optKey];
let dominated = 'flatMap';
dominated = 'with';
export const viaDominating = arr[dominated];
let protoBranch = 'toSpliced';
if (c) protoBranch = 'prototype';
export const viaProtoSkip = arr[protoBranch];
let symbolBranch = 'fill';
if (c) symbolBranch = 'Symbol.iterator';
export const viaSymbolString = arr[symbolBranch];
Array.of = function () {
  return [8];
};
let patched = 'isArray';
if (c) patched = 'of';
export const viaPatched = Array[patched];