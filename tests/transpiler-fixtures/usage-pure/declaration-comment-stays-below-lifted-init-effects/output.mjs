import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// The comments a declaration owns keep leading it below the effects its rewrite lifts out of the
// initializer, which run first - a JSDoc type keeps typing the declaration - whether it opens its
// list or follows a statement. A comment inside each effect shows their order to the structural
// comparison too; a block set apart by a blank line is a section header and stays above the effect.
log(/* first */);
// owned by the declaration that opens the program
const from = _Array$from;
use(from);
log(/* jsdoc */);
/** @type {Function} */
const of = _Array$of;
use(of);
// a section header
log(/* export */);
/* a block comment
   over two lines */
export const fromEntries = _Object$fromEntries;
function body() {
  use(1);
  (log(/* body */), _globalThis).Object;
  // inside a function body, behind a statement
  const entries = _Object$entries;
  return entries;
}