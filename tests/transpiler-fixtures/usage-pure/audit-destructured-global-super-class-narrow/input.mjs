// Array comes from a destructured proxy global, then serves as a class superclass.
// The instance method must narrow through the inheritance to the array polyfill even
// though the proxy global was rewritten to its UID before the superclass was resolved.
const { Array } = globalThis;
class X extends Array {}
new X().includes(0);
