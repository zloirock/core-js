// 3-hop proxy chain `globalThis.self.window.Array.from(...)`: every intermediate hop
// (`self`, `window`) must classify as proxy global so the leaf `Array` static lookup
// resolves at file level. exercises `resolveProxyGlobalRoot`'s while-loop walking
// each MemberExpression `obj` until it bottoms out at a proxy global Identifier
const a = globalThis.self.window.Array.from([1, 2, 3]);
// 4-hop variation through computed brackets - `globalThis['self']['window']['Object']['keys']`
// goes through the computed branch in `resolveObjectName`'s `objectNode.computed`
const b = globalThis['self']['window']['Object'].entries({ x: 1 });
// 4-hop with Promise.try (deeper nesting that still resolves)
const c = globalThis.self.window.self.Promise.try(() => 1);
export { a, b, c };
