// the global twin of the memo-slot look-alike: nothing is memoized here and the source keeps its
// text, so the whole decision is the import set - which makes it the control for the pure side,
// where the same shapes route a guard memo and a twin occurrence through one positional slot.
// a DISTINCT method per row (receiver dispatch and twin alike), so a row that stops resolving
// leaves a hole in the module list instead of hiding behind a neighbour that spells the same name
export function pickLast(fn, o) {
  return o.items?.at(o.items.findLastIndex(fn));
}

export function trimBySum(fn, o) {
  return o.items?.flat(o.items.findIndex(fn));
}

export function padByNested(fn, o) {
  return o.text?.padStart(o.items.flatMap(fn).length);
}

export function plainTail(o) {
  return o.items?.includes(o.items.length - 1);
}
