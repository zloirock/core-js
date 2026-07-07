import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// assignment-cascade statement order (shared canon, probed per shape): an extraction from a
// TOP-LEVEL aliased or shorthand binding prop precedes the surviving residual; a NESTED
// pattern prop's extraction, a rest-forced SHORTHAND sentinel and an array-WRAPPED pattern
// follow it; with no residual, extractions keep source order
let a, b;
a = _Array$from;
({ deep: { other: b } } = _globalThis.Array);
use(a, b);

let s, f, x;
s = _Symbol;
({ deep: { x } } = _globalThis);
f = _Array$from;
use(s, f, x);

let g;
var _unused2;
g = _Array$of;
({ of: _unused2, ...rest } = _globalThis.Array);
use(g, rest);

let inner;
var _unused;
fromEntries = _Object$fromEntries;
({ fromEntries: _unused, ...inner } = _globalThis.Object);
use(fromEntries, inner);