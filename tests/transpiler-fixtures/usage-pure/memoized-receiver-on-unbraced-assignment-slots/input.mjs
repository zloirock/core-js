// an assignment-destructure whose receiver is memoized, in each unbraced control slot: the
// `_ref` declaration and the polyfill assignment reading it belong to ONE block. wrapping the
// slot again for the second insertion leaves the read outside the block that declares it
const obj = { list: [1, 2] };
let a1, l1, a2, l2, a3, l3, a4, l4, a5, l5, a6, l6;
if (c1()) ({ at: a1, length: l1 } = obj.list);
if (!c2()) ; else ({ at: a2, length: l2 } = obj.list);
for (let i = 0; i < 1; i++) ({ at: a3, length: l3 } = obj.list);
for (const x of [1]) ({ at: a4, length: l4 } = obj.list);
for (const k in { a: 1 }) ({ at: a5, length: l5 } = obj.list);
do ({ at: a6, length: l6 } = obj.list); while (false);
console.log(a1, l1, a2, l2, a3, l3, a4, l4, a5, l5, a6, l6);
