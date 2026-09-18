// A pristine proxy step descends into EVERY hop under it, each hop carrying its own key path; the
// drain merges them back under the step they share - a repeated step key nests rather than repeating
// itself - and counts the branch's arity in OUTER props, one of which may cover several hops at once.
// The receiver SELECTS between a user object and the realm, which is what puts the read on the mirror
// at all: off a plain realm root the drain extracts and no step is ever spelled. The negatives are
// the rests: one beside the step and one inside it name a prop the literal cannot reproduce, so the
// whole branch keeps the source on both legs.
const userRoot = { self: { Map: { groupBy: () => 'U' }, Array: { prototype: { at: () => 'U' } } } };

export function branches(flag) {
  let gb, at;
  ({ self: { Map: { groupBy: gb }, Array: { prototype: { at } } } } = flag ? userRoot : globalThis);
  return [gb, at];
}

export function twoStatics(flag) {
  let gb, of;
  ({ self: { Map: { groupBy: gb }, Array: { of } } } = flag ? userRoot : globalThis);
  return [gb, of];
}

export function nestedStep(flag) {
  let gb, of;
  ({ self: { self: { Map: { groupBy: gb }, Array: { of } } } } = flag ? userRoot : globalThis);
  return [gb, of];
}

export function outerArity(flag) {
  let gb, of, parse;
  ({ self: { Map: { groupBy: gb }, Array: { of } }, JSON: { parse } } = flag ? userRoot : globalThis);
  return [gb, of, parse];
}

export function outerRestKeepsSource(flag) {
  let gb, of, rest;
  ({ self: { Map: { groupBy: gb }, Array: { of } }, ...rest } = flag ? userRoot : globalThis);
  return [gb, of, rest];
}

export function innerRestKeepsSource(flag) {
  let gb, rest;
  ({ self: { Map: { groupBy: gb }, ...rest } } = flag ? userRoot : globalThis);
  return [gb, rest];
}
