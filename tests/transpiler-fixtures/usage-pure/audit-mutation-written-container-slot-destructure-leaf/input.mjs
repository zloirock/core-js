// a container slot the file WROTE no longer holds what the literal spells, and the read routes
// that reach it owe one answer: the member spelling and the DESTRUCTURE-LEAF spelling both stay
// native. the clean sibling below keeps its substitution - the record is per slot, not per file
const box = { Array, Map };
box.Array = FakeArray;
const { Array: A } = box;
A.from(src);
box.Array.from(src);
const { Map: M } = box;
M.groupBy(src, it => it);
