import _Symbol from "@core-js/pure/actual/symbol";
// `Symbol[userInput]` - computed key is an unbound identifier, so the member key
// cannot be resolved. plugin polyfills the outer `Symbol` identifier with its whole family -
// the key may name any of its statics - and leaves the dynamic member access in place
_Symbol[userInput];