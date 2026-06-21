import _globalThis from "@core-js/pure/actual/global-this";
// param-free body IIFE: `(arg => globalThis)(Array)` resolves to `globalThis`, so the
// `_globalThis` proxy polyfill emits. the destructure rewrite doesn't unfold the const alias
// chain (it expects a direct proxy-global init), so `{ from } = Result` stays inline; the
// emitted import confirms resolution traced through. complements the body-references-param negative.
const Result = (arg => _globalThis)(Array);
const {
  from
} = Result;
from([1, 2]);