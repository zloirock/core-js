// `('Symbol.' + 'iterator') in obj` - the left operand is a plain string concat,
// not a symbol reference, and `obj` is unresolved, so no polyfill is emitted
('Symbol.' + 'iterator') in obj;