// a for-of / for-in head holds a whole expression up to its `)`, and a case arm's assignment
// runs to the `break` - the fold stays bare in all three
export const spread = [];
for (const item of globalThis.window?.self.Array.of(3, 4)) spread.push(item);
