// usage-pure: a plain var-alias method call where P is reassigned AFTER the use - at `P.allSettled`
// P is still Promise, so pure substitutes `_Promise$allSettled` (the variable-binding-to-global resolver is
// now flow-sensitive: resolves when no reassignment reaches the read). contrast the logical-guard
// sibling where a conditional `c && (P = other)` CAN reach the use and pure bails.
var P = Promise;
P.allSettled([]);
P = Object;
