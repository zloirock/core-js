import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _String$raw from "@core-js/pure/actual/string/raw";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _Object$values from "@core-js/pure/actual/object/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
// many independent (non-nested) polyfill transforms in one file - hits the fast path
// (`#hasNesting()` returns false) so the sort-desc-by-start + overwrite loop fires.
// each line triggers a distinct polyfill to verify they don't cross-contaminate
_Array$from(a);
_Object$fromEntries(b);
_Array$of(1, 2, 3);
Array.isArray(c);
_Number$isInteger(d);
_Number$isFinite(e);
_String$raw`${f}`;
_Symbol$for('x');
_Object$values(g);
_Object$entries(h);