// Passing a constructor to a known builtin does not request all of its static methods.
// Static aliases and builtin instances follow the same boundary; each constructor stays narrow.
Object.is(Array, Array);
const keys = Object.keys;
keys(Map);
Number.isNaN(Set);
const values = new Set();
values.has(Promise);
