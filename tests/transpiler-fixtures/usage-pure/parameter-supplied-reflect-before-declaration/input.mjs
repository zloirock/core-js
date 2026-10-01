// A previously transformed Reflect.apply still identifies the same supplied argument.
// The consumed receiver receives the static polyfill even before the function declaration.
export const result = Reflect.apply(read, null, [Array])([7]);
function read({ from } = Array) { return from; }
