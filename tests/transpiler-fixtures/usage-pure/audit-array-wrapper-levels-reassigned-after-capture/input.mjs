// An outer array captures the inner array value before later binding reassignment.
// Both nested static reads remain native and keep the source snapshot's identity.

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
