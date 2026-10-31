// a bodyless `var` whose instance read spells its receiver again folds the selection the build decides in
// that copy as in the original: the dispatch reads the operand that runs, and the decided test leaves no
// `Symbol` import
export function pick(ready, list, other, box, make) {
  if (ready) var { at } = typeof Symbol != 'undefined' ? list : other;
  else var { flat } = box[typeof Symbol != 'undefined' ? 'a' : 'b'];
  label: var { includes = null } = make(typeof Symbol != 'undefined' ? 1 : 2);
  return [at, flat, includes];
}
