// an IIFE call-arg evaluates AT THE CALL SITE: the union and the meta resolve it in the
// OUTER scope. distinct method per row attributes each arm.
// param-default arm: the LIVE arg supersedes the dead default, and its reachable
// reassignment targets join the union
let R = Object;
if (globalThis.cond) R = Array;
