// An exported static binding under an object key retains both array iterations
// and its native property read before the pure method is exported.
const wrapped = [{ k: [Object] }];
export const [{ k: [{ is }] }] = wrapped;
