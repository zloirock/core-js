// A call of a key that is a static of a constructor core-js ships no replacement of and an instance method of
// other receivers (`entries`) over a selection the build does not decide: the identity guard serves the arm's
// static, and the raw branch invokes the instance dispatch's method with the captured selection as `this`
// (`.call`) - an absorbed `?.()` asking that method, a `?.` on the receiver hoisted over the whole guard
const pairs = { k: 1 };
export const viaCall = (source ?? Object).entries(pairs);
export const viaOptionalCall = (source ?? Object).values?.(pairs);
export const viaOptionalMember = (shim || Object)?.keys(input);
