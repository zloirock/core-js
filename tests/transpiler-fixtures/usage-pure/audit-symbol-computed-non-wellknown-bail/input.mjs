// `Symbol['nonExistent']` - computed-string Symbol member that doesn't name a well-known
// symbol. the receiver still needs the Symbol-constructor polyfill on legacy targets, but
// the `in obj` check must NOT route through any symbol-keyed polyfill (e.g. is-iterable):
// no `symbol/non-existent` entry exists; treating it as such would emit a dead import
const x = Symbol['nonExistent'] in obj;
export { x };
