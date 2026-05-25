// `[Symbol.iterator]` key paired with a NESTED ObjectPattern value (not a simple binding
// identifier). `pure destructuring handler` bails on the nested-value shape via
// `prop binding-identifier resolver` check. previously the `Symbol.iterator` key was added to
// `skippedNodes` BEFORE the bail check, which suppressed the standalone Symbol-Identifier
// visitor from emitting `_Symbol$iterator` - polyfill silently dropped. reordering the
// bail above the skip restores the `_Symbol$iterator` import for the in-key reference
const obj = {};
const { [Symbol.iterator]: { call: fn } } = obj;
fn;
