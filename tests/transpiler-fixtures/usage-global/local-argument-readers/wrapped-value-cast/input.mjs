// A transparent wrapper inside a literal carrier keeps the named source and its writes.
// The changed array slot can hold a string; its method must retain both receiver families.
const box: any = { rows: [8, 9] };
box.rows = "ab";
const { slot: { rows } } = { slot: (box as typeof box) };
use(rows.includes("ab"));
