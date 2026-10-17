import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an IIFE call-arg evaluates AT THE CALL SITE: the union and the meta resolve it in the
// OUTER scope. distinct method per row attributes each arm.
// param-default arm: the LIVE arg supersedes the dead default, and its reachable
// reassignment targets join the union
let R = Object;
if (globalThis.cond) R = Array;
export const viaDefaultArm = (({
  from
} = Map) => from)(R);