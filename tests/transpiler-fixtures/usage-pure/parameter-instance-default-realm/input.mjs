// A realm default supplies its constructor's prototype as the instance receiver.
// Supplied arguments bypass the default and keep their own receiver families and properties.
export const read = ({ Array: { prototype: { includes, flat } } } = globalThis) => [includes, flat];
