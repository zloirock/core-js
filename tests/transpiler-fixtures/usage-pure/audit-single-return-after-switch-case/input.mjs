// Switch cases can return Map or Set before the Array tail. The retained-body proof leaves
// the switch intact, and every return guards the read as a candidate: the Array a fallthrough
// reaches serves its static, while Map and Set need constructor bindings only.
const out = (() => { switch (kind) { case 'a': return Map; case 'b': return Set; } return Array; })().from([1]);
export { out };
