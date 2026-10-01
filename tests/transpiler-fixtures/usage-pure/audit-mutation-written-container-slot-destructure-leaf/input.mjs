// a container slot the file WROTE no longer holds what the literal spells, and the read routes
// that reach it owe one answer - neither substitutes the literal's value: the member spelling stays
// native, the DESTRUCTURE-LEAF binding guards its read on the candidates. the clean sibling below
// keeps its substitution - the record is per slot, not per file
const box = { Array, Map };
box.Array = FakeArray;
const { Array: A } = box;
A.from(src);
box.Array.from(src);
const { Map: M } = box;
M.groupBy(src, it => it);
