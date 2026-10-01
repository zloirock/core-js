// An exported static binding under an object key still injects Object.is.
// The source retains both array levels and its property read.
const wrapped = [{ k: [Object] }];
export const [{ k: [{ is }] }] = wrapped;
