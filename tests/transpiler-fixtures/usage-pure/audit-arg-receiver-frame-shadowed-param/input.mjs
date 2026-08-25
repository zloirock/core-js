// the IIFE call-ARG evaluates at the CALL SITE, so every scope-aware question about it - and about
// each BRANCH, hop and key inside it - has to be asked there. a same-named parameter shadows those
// bindings inside the invoked function, and asking in that frame turns a resolvable receiver into
// an unknown one: the branch mirror declined and the polyfill silently vanished on a rename alone
let calls = 0;
function mk() {
  calls += 1;
  return Array;
}
const cond = true;
const viaBranch = (function ({ from } = Object, mk) {
  return from;
})(cond ? mk() : Object);
const viaLogical = (function ({ from } = Object, mk) {
  return from;
})(mk() || Object);
const viaHopKey = (function ({ from } = Object, mk) {
  return from;
})(globalThis[(mk(), 'Array')]);

// ... and the RESCUE the drain re-emits is a CLONE of that receiver: a clone inherits no frame of
// its own, so the proxy-root substitution asked about the copy in the pattern's frame, saw the
// parameter binding and left a RAW `globalThis` read - the one spelling the pure flavour may never
// emit (an engine without it answers a ReferenceError, which is what the ponyfill import prevents)
let hits = 0;
const viaProxyRescue = (function ({ from } = Object, globalThis) {
  return from;
})(globalThis[(hits++, 'Array')]);
const viaProxySeRescue = (function ({ from } = Object, globalThis) {
  return from;
})((hits++, globalThis).Array);

// ... and a node the channel SYNTHESIZES off that receiver inherits the frame the same way: the
// sealed-nav probe is planned on the pristine tree and its guard object is a CLONE, so an unstamped
// copy tested `globalThis.window` through the parameter and shipped a raw global read
const viaSealedNav = (function ({ from } = Object, globalThis) {
  return from;
})((globalThis.window?.self).Array);

// control: the same shapes with the parameter renamed - they always resolved, and still do
const plainBranch = (function ({ from } = Object, zz) {
  return from;
})(cond ? mk() : Object);
export {
  calls,
  hits,
  viaBranch,
  viaLogical,
  viaHopKey,
  viaProxyRescue,
  viaProxySeRescue,
  viaSealedNav,
  plainBranch,
};
