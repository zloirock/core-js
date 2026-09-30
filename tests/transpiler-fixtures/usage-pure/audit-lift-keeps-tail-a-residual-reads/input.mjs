// Sequence-wrapped exports extract static and instance leaves from their selected receivers.
// A surviving rest pattern keeps its receiver and excludes the extracted static key.
const arr = [1];
export const { of, name } = (0, Array);
export const { at } = (0, arr);
export const { from } = (0, Array);
export const { of: of2, ...rest } = (0, Array);
