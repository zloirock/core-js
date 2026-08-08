// a top-level arrow keeps the lexical module `this` - the same pragmatic global-proxy
// assumption applies, so the chain resolves like `globalThis.Array.from(...)`. `this` inside
// a NON-arrow function or a class body is rebound and never narrows
const fn = () => this.Array.from([1, 2]).at(0);
