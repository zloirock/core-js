// a claimable static method inside a kept-assign call tail claims INSIDE the outer guard's
// memo body (the ponyfill canon both emitters read through the memo - a raw invocation would
// miss the polyfill exactly where the target engine lacks the native)
let k;
export const keptFrom = (k = globalThis.window)?.self.Array.from([4]).at(0);
// control: the same navigation claims normally when nothing captures it
export const liveIsArray = globalThis.self.Array.isArray([4]);
