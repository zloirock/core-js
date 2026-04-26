// `(Symbol?.iterator) in obj` parenthesised optional access: the `in`-check on a
// well-known symbol still routes through the iterability polyfill dispatch.
const obj = {};
(Symbol?.iterator) in obj;
