// The flat prototype read has the same receiver families as the nested pattern.
// Every written realm value yields an array receiver or throws before the method read.
// A null alternative throws in the same way and contributes no string family.
let effects = 0;
let realm = globalThis;
const rebind = () => { realm = {}; };
const { at } = (effects++, realm.Array.prototype);
let nullableRealm = globalThis;
const clear = () => { nullableRealm = null; };
const { Array: { prototype: { includes } } } = nullableRealm;
