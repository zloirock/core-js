// userCallback that does not explicitly return: implicit `undefined` is falsy in
// `getModulesForEntry`'s `result.push(resolved)` guard, so all polyfills get suppressed.
// trusted-config: callbacks that forget to return are user bugs, no plugin diagnostic
'str'.at(-1);
