// A bodyless `var` slot whose pattern a static claim consumes keeps only what its init still runs, in
// the init's live spelling, ahead of the bindings it fed: the prefix with its own claim served, and of
// a nav off a call that resolves to the realm only what that call owes - nothing for a quiet one -
// whether one claim empties the pattern or several do together.
const realm = () => globalThis;
const stamp = () => (realm.count = 1, globalThis);
const lists = [[1], [2]];
if (lists.length) var { groupBy } = (lists.flat(), realm().Map);
if (lists.length) var { from } = (lists.at(0), stamp().Array);
if (lists.length) var { allSettled } = realm().Promise;
if (lists.length) var { of } = realm().Array;
if (lists.length) var { entries, fromEntries } = (lists.findLastIndex(Boolean), stamp().Object);
if (lists.length) var { values, hasOwn } = realm().Object;
export { groupBy, from, allSettled, of, entries, fromEntries, values, hasOwn };
