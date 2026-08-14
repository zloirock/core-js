import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a declaration the extraction splits into several statements keeps its leading comment on the
// FIRST of them, whichever host decides the split - a plain one, an exported one, a
// multi-declarator one. a comment after the declaration is a trailing one and stays there
const of = _Array$of;
const from = _Array$from;
/** exported host */
export const keys = _Object$keys;
/* multi-declarator host */
const fromEntries = _Object$fromEntries;
const other = 1;
const values = _Object$values; // trailing, not leading
console.log(of, from, fromEntries, other, values);