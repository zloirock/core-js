// two array-wrapper levels over a const alias of a reassigned array: the outer literal captured the
// ORIGINAL inner array, so a write to `inner` after that capture cannot change the leaf - it stays
// Array and `from` resolves. the deeper level anchors at the capture (the outer declarator), not at
// the destructure host; a write BEFORE the capture reaches the leaf and decides it (Object here)

let inner = [Array];
const outer = [inner];
inner = [Object];
const [[{ from }]] = outer;
export const afterCapture = from('ab');

let inner2 = [Array];
inner2 = [Object];
const outer2 = [inner2];
const [[{ fromEntries }]] = outer2;
export const beforeCapture = fromEntries([]);
