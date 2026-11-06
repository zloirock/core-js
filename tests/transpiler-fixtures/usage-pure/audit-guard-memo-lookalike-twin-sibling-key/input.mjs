// BOUNDARY: the root and the argument share a PREFIX but not the whole root text - the
// structural-boundary gate already rejects it, and the position gate agrees
export function siblingKey(fn, o) {
  return o.items?.at(o.itemsExtra.findLastIndex(fn));
}
