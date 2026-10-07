import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The realm itself on the left of `||` / `??` - a global this build serves - decides the selection: a key
// naming both an instance method and a static of the right's constructor stays a read off the realm, and
// the right's static gets no entry.
const {
  entries
} = _globalThis;
const {
  search
} = _self;
export { entries, search };