// 3-deep nested destructure assignment via alias-hop (globalThis.self.X.Y). both
// polyfills resolve through the self-alias receiver. each assignment emits independently;
// the empty destructure is removed
let from, fromEntries;
({ self: { Array: { from }, Object: { fromEntries } } } = globalThis);
