// A guarded receiver reused by an outer dispatch must still be found when comments or whitespace separate it from its optional
// connector.
const a = { b: { c: [[1], [2]] } };
a.b /* keep me */ ?.c.slice(1).flat(2);
