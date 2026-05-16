// pure-version of param-free body IIFE: `(arg => globalThis)(Array)` resolves to
// `globalThis`. `Result` -> globalThis through the resolver, so `_globalThis` proxy
// polyfill emits. the destructure rewrite doesn't unfold the const alias chain (it
// expects a direct proxy-global init), so `{ from } = Result` stays inline; the import
// confirms resolution traced through. complements the negative case where body
// references the param non-trivially.
const Result = (arg => globalThis)(Array);
const { from } = Result;
from([1, 2]);
