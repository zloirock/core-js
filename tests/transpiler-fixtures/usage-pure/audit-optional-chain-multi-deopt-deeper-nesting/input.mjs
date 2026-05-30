// deep optional chain with TWO separated optional clusters: a leading `?.` pair, then a run
// of non-optional hops, then a trailing `?.`. each nested polyfill combine collapses only the
// `?.` markers it folded and keeps the rest. compose must rebuild every inner needle in its
// partially-deoptionalized form across both clusters, not strip the whole chain at once
const r = arr?.flatMap(f)?.flat().at(0).includes(1)?.findLast(p);
