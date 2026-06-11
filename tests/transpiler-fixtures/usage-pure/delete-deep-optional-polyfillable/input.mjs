// a DEEP optional slot-delete collapses onto the routed constructor like any proxy-chain
// mutation: the delete lands on the object every transformed surface shares, and the
// mutated key's own entry is imported up front (polyfill-then-patch)
delete globalThis?.Promise?.resolve;
