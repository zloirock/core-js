import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.entries";
// a MEMBER read in a declarator init is no destructure leaf: the indirection backstop enumerating
// branching receivers answers for a pattern's host slot, and a member handed to it must not resolve
// the whole init as its receiver - `pick(input.of)` names Array nowhere, so es.array.of stays out.
// the destructure form of the same call still enumerates both branches. the hosts keep the value to
// themselves: handing the branch OUT is an escape, and an escaped constructor owes its namespace -
// which would answer for every static and bury what this fixture measures
const cond = 1;
function pick() {
  return cond ? Array : Object;
}
export function viaInit(input) {
  const out = pick(input.of);
  return typeof out;
}
export function viaAssign(input) {
  let out;
  out = pick(input.isArray);
  return typeof out;
}
export function control(input) {
  pick(input.entries);
}
export const {
  from
} = pick();