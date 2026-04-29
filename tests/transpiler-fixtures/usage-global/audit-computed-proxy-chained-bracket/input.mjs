// computed bracket access on a proxy global `globalThis['Array'].from(...)`: the static
// member is still recognised as `Array.from` and rewritten to the polyfill.
globalThis["Array"].from([1]);
globalThis["self"]["Object"].keys("abc");
