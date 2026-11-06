// A call of a key that is a static of a constructor and an instance method of other receivers (`entries`)
// over a selection the build does not decide injects both: the static for the constructor arm, the
// instance family for any other value - whichever arm runs, with or without a `?.`
const pairs = { k: 1 };
export const viaCall = (source ?? Object).entries(pairs);
export const viaOptionalCall = (source ?? Object).values?.(pairs);
export const viaOptionalMember = (shim || Object)?.keys(input);
