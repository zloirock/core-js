// An undecided Array/Iterator selection serves `from` for each arm. A plain sibling follows the
// selected receiver; pure Iterator retains the existing pure-constructor whole-swap boundary rather
// than reading the ambient constructor object.
export function read(flag) {
  const { from, custom } = flag ? Array : Iterator;
  return [from, custom];
}
