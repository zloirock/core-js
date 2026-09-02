import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
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
flat = _flatMaybeArray(arr);
use(flat);