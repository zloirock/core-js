// computed-key BinaryIn LHS through a proxy global: `globalThis['from'] in Array`.
// LHS string-literal access via globalThis chain doesn't fold to a polyfill candidate
// (the key resolves to runtime value, not the static `'from'` key on Array). plugin
// registers the proxy-global polyfill and the possible Array statics for the opaque key,
// without folding the in-expression to true
globalThis['from'] in Array;
