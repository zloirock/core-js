import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// usage-pure: a plain var-alias method call where P is reassigned AFTER the use - at `P.allSettled`
// P is still Promise, so pure substitutes `_Promise$allSettled` (resolveVariableBindingToGlobal is
// now flow-sensitive: resolves when no reassignment reaches the read). contrast the logical-guard
// sibling where a conditional `c && (P = other)` CAN reach the use and pure bails.
var P = _Promise;
_Promise$allSettled([]);
P = Object;