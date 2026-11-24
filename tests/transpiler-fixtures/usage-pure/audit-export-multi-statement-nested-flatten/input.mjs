// A mirror serves Array.from and reads the remaining property while the original pattern
// exports both bindings in one declaration.
export const { Array: { from }, includes: arrIncludes } = globalThis;
[from, arrIncludes];
