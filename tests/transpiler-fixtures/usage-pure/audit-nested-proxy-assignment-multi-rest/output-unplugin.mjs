import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _globalThis from "@core-js/pure/actual/global-this";
// multiple polyfilled props in the same outer pattern with sibling rest. each polyfilled
// receiver lands on a distinct `_unused` sentinel; the destructure consumes every key
// (rest still excludes them) and per-extraction polyfill assigns ensure polyfill always wins.
// distinct method names ensure each line maps to a unique import for traceability
let from, fromEntries, rest;
var _unused, _unused2;
({ Array: _unused, Object: _unused2, ...rest } = _globalThis);
from = _Array$from;
fromEntries = _Object$fromEntries;