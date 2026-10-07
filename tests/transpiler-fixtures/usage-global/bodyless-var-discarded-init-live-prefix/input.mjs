// In usage-global the bodyless slots stay as written: each claim injects its own module - the instance
// method in the prefix and the static read off the realm nav alike - and the realm call keeps its read.
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
