// `(0, Symbol).iterator in obj` wraps the receiver in a side-effect-free comma expression;
// static detection must see through the paren/sequence and collapse it to `_isIterable(obj)`
(0, Symbol).iterator in obj;
