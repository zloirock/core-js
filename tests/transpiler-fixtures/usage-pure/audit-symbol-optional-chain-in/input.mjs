// `Symbol?.iterator in obj` - optional-chain form must be recognised as
// `Symbol.iterator in obj`, so the is-iterable polyfill is injected
Symbol?.iterator in obj;
