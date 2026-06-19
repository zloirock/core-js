// the user-object branch has NO `from` (legitimately undefined). a per-branch default
// (`from = _Array$from`) would fire on that undefined and REPLACE it with the polyfill, corrupting
// the user branch. an inner rest can't be mirrored (the synth literal can't carry the unknown
// remaining keys), so the receiver stays native: `from` is undefined on the user branch exactly as
// native, and a polyfill is injected only where the receiver is unconditionally a global proxy
const userObj = { Array: {} };
let useGlobal = false;
const { Array: { from, ...rest } } = useGlobal ? globalThis : userObj;
typeof from;
