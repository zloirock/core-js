// An undecided nested selection evaluates only the selected effectful call, once, and serves `from`
// for that arm. A plain sibling follows the selected receiver; pure Iterator retains the existing
// pure-constructor whole-swap boundary rather than reading the ambient constructor object.
export function select(first, second) {
  let calls = 0;
  const { from, custom } = first ? (() => { calls++; return Array; })()
    : second ? (() => { calls++; return Iterator; })() : Array;
  return [from, custom, calls];
}
