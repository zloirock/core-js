// a memoized guard root whose source text REPEATS inside its own guarded branch: the second
// occurrence is a look-alike twin, not the root, and only its source position tells them apart.
// picking the memo slot by text alone hands the twin's emit to the guard - the guard then holds an
// index where the receiver belongs, and the twin keeps its raw, unpolyfilled call.
// a DISTINCT method per row on both sides of the pair, so a row that stops resolving leaves a hole
// in the import set rather than hiding behind a neighbour spelling the same name
export function pickLast(fn, o) {
  return o.items?.at(o.items.findLastIndex(fn));
}

export class Box {
  items = [];
  trim(fn) {
    return this.items?.flat(this.items.findIndex(fn));
  }
}

export function padByNested(fn, o) {
  return o.text?.padStart(o.items.flatMap(fn).length);
}

// TWO twins past the root: each takes its own slot, and the ordinals must not drift
export function sumTwins(fn, o) {
  return o.items?.includes(o.items.findLastIndex(fn) + o.items.findIndex(fn));
}

// BOUNDARY: the root and the argument share a PREFIX but not the whole root text - the
// structural-boundary gate already rejects it, and the position gate agrees
export function siblingKey(fn, o) {
  return o.items?.at(o.itemsExtra.findLastIndex(fn));
}

// NEGATIVE: no polyfilled call in the argument, so nothing competes for the slot
export function plainTail(o) {
  return o.items?.at(o.items.length - 1);
}
