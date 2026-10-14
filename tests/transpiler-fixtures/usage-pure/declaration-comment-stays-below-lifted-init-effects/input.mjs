// The comments a declaration owns keep leading it below the effects its rewrite lifts out of the
// initializer, which run first - a JSDoc type keeps typing the declaration - whether it opens its
// list or follows a statement. A comment inside each effect shows their order to the structural
// comparison too; a block set apart by a blank line is a section header and stays above the effect.

// owned by the declaration that opens the program
const { from } = (log(/* first */), Array);
use(from);
/** @type {Function} */
const { of } = (log(/* jsdoc */), Array);
use(of);
// a section header

/* a block comment
   over two lines */
export const { fromEntries } = (log(/* export */), Object);
function body() {
  use(1);
  // inside a function body, behind a statement
  const { entries } = (log(/* body */), globalThis).Object;
  return entries;
}
