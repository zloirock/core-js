// An unknown runtime key keeps the constructor read native in pure.
// Its static may be absent on an old engine; no whole-surface dispatch is generated.
let C = Array;
if ([1].length) C = Object;
let key = 'x';
if ([1].length) key = 'groupBy';
export const result = typeof C[key];