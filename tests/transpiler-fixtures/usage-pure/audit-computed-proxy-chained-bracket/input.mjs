// computed bracket access on a proxy global `globalThis['Array'].from(...)`: the
// static member is recognised as `Array.from` and rewritten in pure-mode.
globalThis["Array"].from([1]);
globalThis["self"]["Object"].keys("abc");
