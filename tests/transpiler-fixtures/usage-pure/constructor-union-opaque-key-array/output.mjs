// An unknown runtime key keeps the constructor read native in pure.
// Its static may be absent on an old engine; no whole-surface dispatch is generated.
let C = Object;
if ([1].length) C = Array;
let key = 'x';
if ([1].length) key = 'from';
export const result = typeof C[key];