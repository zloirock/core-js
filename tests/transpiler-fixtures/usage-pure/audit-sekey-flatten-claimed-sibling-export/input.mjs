// An exported computed-key binding keeps internal receiver temporaries private.
// Its receiver evaluates before its key effect and property read, at the original declaration slot.
// The for-init twin preserves the same order inside the header.
const holder = { p: [1, 2, 3] };
let k = 0;
export const { Array: { from } } = globalThis, { [(k++, 'flat')]: fl } = holder.p;
console.log(from, fl, k);
for (const { Array: { of2 } } = globalThis, { [(k++, 'at')]: q } = holder.p; k < 0;) console.log(of2, q);
