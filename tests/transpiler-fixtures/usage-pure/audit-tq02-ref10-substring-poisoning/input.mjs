// stress test for substring poisoning of `_ref` UIDs. chain enough polyfills to push
// numbering past `_ref9` to `_ref10` - the `_ref` substring lives inside `_ref10`, so
// nth-occurrence math + indexOf-based scan must distinguish needle position when
// multiple identifiers share the prefix. distinct methods per line ensure separate
// emission slots, so any cross-contamination would surface in the fixture diff
const a = arr.flat().at(0).includes(1);
const b = arr.flat().at(0).findLast(p);
const c = arr.flat().at(0).findLastIndex(p);
const d = arr.flat().findLast(p).at(0);
const e = arr.flat().findLastIndex(p).at(0);
const f = arr.findLast(p).flat().at(0);
