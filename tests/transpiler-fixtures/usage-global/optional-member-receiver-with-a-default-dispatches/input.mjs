// a defaulted instance read off an optional member dispatches as off the plain member: the `?.` read is one
// member in both dialects, and the guard keeps the default for an undefined dispatch
export const { flat = null } = box?.list;
export const { at = null } = box?.['items'];
let includes;
({ includes = null } = box?.text);
export { includes };
