import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol['nonExistent']` - computed-string Symbol member that doesn't name a well-known
// symbol. the receiver still needs the Symbol-constructor polyfill on legacy targets, but
// the `in obj` check is NOT routed through any symbol-keyed polyfill (e.g. is-iterable):
// the lookup bails when the key has no matching `symbol/<name>` entry so no dead import
// is emitted
const x = _Symbol['nonExistent'] in obj;
export { x };