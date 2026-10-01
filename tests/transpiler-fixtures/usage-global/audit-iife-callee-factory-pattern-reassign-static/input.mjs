// An IIFE-callee receiver `f()` whose factory `f` is reassigned through a PATTERN LHS
// (`[f] = [() => Array]`) must still surface the reachable factory return value, so the static read on
// its result injects. the alias-value enumerator needs the factory name to pair the pattern slot;
// without it the reassignment is skipped and the polyfill is dropped.
let f = () => Object;
[f] = [() => Array];
f().from([1]);
