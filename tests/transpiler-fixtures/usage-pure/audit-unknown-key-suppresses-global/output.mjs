import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol[userInput]` — computed key `userInput` is unbound, so `resolveKey` returns null.
// `buildMemberMeta` bails (null key), `markHandledObjects` never fires, identifier visitor
// polyfills the outer `Symbol`. the "overreach" is theoretical — only the resolvable-key
// path marks `Symbol`, and that path either emits a full replacement (Symbol.iterator →
// `_Symbol$iterator`) or falls back to `resolvePureOrGlobalFallback` (Symbol.unknownKey →
// `_Symbol.unknownKey`), both of which subsume the identifier
_Symbol[userInput];