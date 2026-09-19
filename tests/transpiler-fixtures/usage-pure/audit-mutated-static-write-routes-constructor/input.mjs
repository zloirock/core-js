// a monkey-patched static routes EVERY surface through the injected constructor: the write
// patches the ponyfill object and the read sees it there - one object for both, working even
// when the native global is missing on the target
Map.foo = 123;
export const result = Map.foo;
