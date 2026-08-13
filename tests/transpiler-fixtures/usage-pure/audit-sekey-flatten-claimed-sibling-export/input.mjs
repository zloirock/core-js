// an EXPORTED flatten-claimed declaration whose LATER declarator memoizes an SE-key receiver:
// the routed memo takes the non-exported statement form ahead of the slot, so the internal ref
// temp stays off the module's export surface while every user binding is re-exported. the
// for-init twin keeps the comma-declarator memo (a loop header cannot be exported)
const holder = { p: [1, 2, 3] };
let k = 0;
export const { Array: { from } } = globalThis, { [(k++, 'flat')]: fl } = holder.p;
console.log(from, fl, k);
for (const { Array: { of2 } } = globalThis, { [(k++, 'at')]: q } = holder.p; k < 0;) console.log(of2, q);
