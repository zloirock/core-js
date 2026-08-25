import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
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
const viaBranch = function ({
  from
} = Object, mk) {
  return from;
}(cond ? (mk(), {
  from: _Array$from
}) : Object);
const viaLogical = function ({
  from
} = Object, mk) {
  return from;
}((mk(), {
  from: _Array$from
}));
const viaHopKey = function ({
  from
} = Object, mk) {
  return from;
}((_globalThis[mk(), 'Array'], {
  from: _Array$from
}));

// ... and the RESCUE the drain re-emits is a CLONE of that receiver: a clone inherits no frame of
// its own, so the proxy-root substitution asked about the copy in the pattern's frame, saw the
// parameter binding and left a RAW `globalThis` read - the one spelling the pure flavour may never
// emit (an engine without it answers a ReferenceError, which is what the ponyfill import prevents)
let hits = 0;
const viaProxyRescue = function ({
  from
} = Object, globalThis) {
  return from;
}((_globalThis[hits++, 'Array'], {
  from: _Array$from
}));
const viaProxySeRescue = function ({
  from
} = Object, globalThis) {
  return from;
}(((hits++, _globalThis).Array, {
  from: _Array$from
}));

// ... and a node the channel SYNTHESIZES off that receiver inherits the frame the same way: the
// sealed-nav probe is planned on the pristine tree and its guard object is a CLONE, so an unstamped
// copy tested `globalThis.window` through the parameter and shipped a raw global read
const viaSealedNav = function ({
  from
} = Object, globalThis) {
  return from;
}(((null == _globalThis.window ? void 0 : _self).Array, {
  from: _Array$from
}));

// control: the same shapes with the parameter renamed - they always resolved, and still do
const plainBranch = function ({
  from
} = Object, zz) {
  return from;
}(cond ? (mk(), {
  from: _Array$from
}) : Object);
export { calls, hits, viaBranch, viaLogical, viaHopKey, viaProxyRescue, viaProxySeRescue, viaSealedNav, plainBranch };