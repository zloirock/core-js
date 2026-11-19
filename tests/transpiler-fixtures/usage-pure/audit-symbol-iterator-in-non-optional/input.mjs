// `Symbol.iterator in obj` non-optional form: the iterability `in`-check is rewritten
// through the polyfill dispatch.
Symbol.iterator in obj;
Symbol?.iterator in obj;
