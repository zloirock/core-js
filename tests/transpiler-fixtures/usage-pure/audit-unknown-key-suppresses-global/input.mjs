// `Symbol[userInput]` - computed key is an unbound identifier, so the member key
// cannot be resolved. plugin polyfills the outer `Symbol` identifier (constructor)
// and leaves the dynamic member access in place
Symbol[userInput];
