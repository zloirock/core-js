import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// a `-next-line` over a MULTI-LINE minifier sequence covers the whole statement the author wrote,
// so every product of the split stays opted out, the destructure on the third line included -
// the directives are read before the split, off the statement as written; the directive-less
// twin below pins that the split itself still reaches that line
const arr = [1, [2]];
let at, flat;
// core-js-disable-next-line
eff();
// core-js-disable-next-line
({
  at
} = arr);
// core-js-disable-next-line
use(at);
eff2();
({
  flat
} = arr);
use(flat);