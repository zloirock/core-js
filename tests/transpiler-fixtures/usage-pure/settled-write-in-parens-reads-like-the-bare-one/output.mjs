import _Array$of from "@core-js/pure/actual/array/of";
// a write spelled in parens is the same write: a branching construct whose every arm writes the
// binding settles it for a read below, whether the parser keeps the parens as a node or not
let key = 'from';
if (flag) {
  (key = 'of');
} else {
  (key = 'of');
}
export const made = _Array$of(1);