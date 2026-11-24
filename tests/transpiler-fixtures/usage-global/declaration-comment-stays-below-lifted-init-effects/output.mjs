import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Global mode keeps each initializer intact. Declaration comments, JSDoc and the section header
// keep their source positions relative to the logged effects.

// owned by the declaration that opens the program
const {
  from
} = (log(/* first */), Array);
use(from);
/** @type {Function} */
const {
  of
} = (log(/* jsdoc */), Array);
use(of);
// a section header

/* a block comment
   over two lines */
export const {
  fromEntries
} = (log(/* export */), Object);
function body() {
  use(1);
  // inside a function body, behind a statement
  const {
    entries
  } = (log(/* body */), globalThis).Object;
  return entries;
}