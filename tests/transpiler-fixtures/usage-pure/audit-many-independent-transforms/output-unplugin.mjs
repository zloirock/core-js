import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _String$raw from "@core-js/pure/actual/string/raw";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _Object$values from "@core-js/pure/actual/object/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
// many independent, non-nested polyfills in one file - exercises the fast path for the
// transform queue (no composition between entries). each line triggers a distinct polyfill
// so their rewrites shouldn't leak into each other's ranges
_Array$from(a);
_Object$fromEntries(b);
_Array$of(1, 2, 3);
Array.isArray(c);
_Number$isInteger(d);
_Number$isFinite(e);
_String$raw`${ f }`;
_Symbol$for('x');
_Object$values(g);
_Object$entries(h);