// duplicate object-literal keys: ECMAScript keeps the LAST property, so the binding holds the string
// and the array default is dead. the member-presence probe must read the last matching property - a
// find-first scan saw the leading `undefined`, treated the member as absent, fired the array default,
// and narrowed the string to the array `at` helper.
const { dup = [] } = { dup: undefined, dup: 'tail' };
dup.at(0);
