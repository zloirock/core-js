// Collapsing a deep proxy receiver must retain the prefix and its own static claim.
// The prefix runs before the outer call, and both statics need separate polyfills.
const effects = [];
const result = (effects.push(Array.of('prefix')[0]), globalThis).self.self.self.self.self.self.self.self.Array.from([7]);
