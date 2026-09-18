// Switch cases can return Map or Set before the Array tail. The retained-body proof leaves
// the switch intact. The local read needs constructor bindings, not their unused statics.
const out = (() => { switch (kind) { case 'a': return Map; case 'b': return Set; } return Array; })().from([1]);
export { out };
