// A native array-wrapped self extraction still identifies the realm for a later static read.
// Promise.resolve receives its dedicated import.
const [{ self: fromArray }] = [globalThis];
export const destructuredThroughArray = fromArray.Promise.resolve(1);
