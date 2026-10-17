// A called closure can replace the array held by an alias before a nested pattern reads it.
// Global usage collects the written static; pure keeps this unresolved native read.
let viaClosure = [Array];
const setClosure = () => { viaClosure = [Object]; };
setClosure();
const [{ fromEntries }] = viaClosure;
export const closureWrite = fromEntries([]);
