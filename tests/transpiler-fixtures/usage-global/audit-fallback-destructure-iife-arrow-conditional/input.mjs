// fallback destructure receiver wrapped in zero-arg arrow-expression-body IIFE:
// `(() => cond ? Array : Iterator)()`. without IIFE peel `buildDestructuringInitMeta`
// sees the CallExpression and bails to `object: null`, so the `fromFallback` flag never
// fires and `enumerateFallbackDestructureBranches` skips per-branch dispatch. with the
// peel the conditional reaches `resolveConditionalDestructureMeta`, both branches
// (Array.from + Iterator.from) get enumerated and their es.* polyfills emitted.
const { from } = (() => cond ? Array : Iterator)();
from([1, 2]);
