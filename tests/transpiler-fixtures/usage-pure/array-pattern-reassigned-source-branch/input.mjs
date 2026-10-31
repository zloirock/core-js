// A conditional write can replace the array held by an alias before a nested pattern reads it.
// Global usage collects statics from both sources; pure keeps the unresolved native read.
let viaBranch = [Object];
if (c) viaBranch = [Array];
const [{ from }] = viaBranch;
export const conditionalWrite = from('ab');
