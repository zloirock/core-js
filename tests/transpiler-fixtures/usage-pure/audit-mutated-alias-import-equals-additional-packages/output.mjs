import _Array$from from "@core-js/pure/actual/array/from";
// the TS require-import twin of the aliased-package proxy import: the binding hosts the
// same global object, so a patch through it must deopt the slot
import g = require('my-core-js/actual/global-this');
g.Map = class PatchedMap extends Map {};
export const patched = Map.groupBy([1], x => x);
// an untouched builtin keeps its substitution - the deopt is per-name
export const control = _Array$from('ab');