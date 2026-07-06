import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `[Symbol.iterator]` leaf under a single-ctor-key ANCHOR extracts through the iterator-
// method helper off the anchored CONSTRUCTOR (the pure ctor binding when one exists, else a
// member read off the proxy binding), exactly like its proxy-outer twin: a sole binding
// drops the declarator, a static sibling extracts alongside in source order, an inner rest
// keeps the re-keyed sentinel in the residual anchored on the same base
const a = _getIteratorMethod(_globalThis.Array);
a;
const m = _getIteratorMethod(_Map);
m;
const o = _getIteratorMethod(_globalThis.Object);
const fe = _Object$fromEntries;
o;
fe(x);
const s = _getIteratorMethod(_Set);
const {
  [_Symbol$iterator]: _unused,
  ...ri
} = _Set;
s;
ri;