// `var Symbol = Symbol` - self-referential var binding resolves to the global.
// Works for `Symbol` too, not only `Map`/`Set`/`Promise`. `Symbol.iterator in obj`
// still receives its specialized polyfill.
var Symbol = Symbol;
Symbol.iterator in obj;
