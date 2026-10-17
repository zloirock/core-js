import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// the IIFE call-ARG evaluates at the CALL SITE, so every scope-aware question about it - and about
// each BRANCH, hop and key inside it - has to be asked there. a same-named parameter shadows those
// bindings inside the invoked function, and asking in that frame turns a resolvable receiver into
// an unknown one: the branch mirror declined and the polyfill silently vanished on a rename alone
let calls = 0;
function mk() {
  calls += 1;
  return Array;
}
const viaHopKey = function ({
  from
} = Object, mk) {
  return from;
}((_globalThis[mk(), 'Array'], {
  from: _Array$from
}));
export { calls };
export { viaHopKey };