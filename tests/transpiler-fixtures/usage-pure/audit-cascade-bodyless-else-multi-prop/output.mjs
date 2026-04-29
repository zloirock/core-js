import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// alternate slot of an if (the else branch with no braces). symmetric to consequent-
// slot wrap: the bodyless detector covers both consequent and alternate, the second
// polyfill must stay inside the gate when else has no block
let from, fromEntries;
if (cond) noop();else {
  from = _Array$from;
  fromEntries = _Object$fromEntries;
}