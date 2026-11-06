import _Iterator from "@core-js/pure/actual/iterator";
// mutation targets behind transparent wrappers route too: an optional delete (estree wraps
// the chain), an oxc-preserved paren delete and a paren compound assignment
delete _Iterator.toAsync;