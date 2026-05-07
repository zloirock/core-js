// multi-level proxy-global recursion: `globalThis.window.self === globalThis` at
// runtime, so destructuring through three proxy-global keys reaches the same Array
// constructor. before the fix, the resolver bailed on the first non-Identifier value;
// after the fix, walkProxyDestructurePattern recurses through every intermediate key
// when each is itself in POSSIBLE_GLOBAL_OBJECTS
const { window: { self: { Array } } } = globalThis;
const arr = Array.from([1, 2, 3]);
export { arr };
