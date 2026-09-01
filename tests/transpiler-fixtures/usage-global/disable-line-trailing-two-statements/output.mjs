import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.with";
// a trailing -line covers every statement on its line, and the reprint lays them one per line:
// each covered statement is led by its own directive in the output, so a second pass over it
// keeps the same opt-out - the reprint alone would leave only the last one under the directive.
// a one-line block expands the same way and would leave the directive under its closing brace
// core-js-disable-next-line
use(a.at(0));
// core-js-disable-next-line
use(b.flat()); // core-js-disable-line
export const after = c.toSorted(cmp);
// core-js-disable-next-line
if (cond) {
  use(d.findLast(f));
  use(e.toSpliced(0, 1));
} // core-js-disable-line
export const afterBlock = g.with(0, 1);