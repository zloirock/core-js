// `Symbol.foo` isn't a well-known key: resolveSymbolInEntry returns null, so the property
// access is NOT rewritten but the bare `Symbol` identifier still needs its constructor polyfill
const x = obj[(Symbol as any).foo];
