// Destructuring where every key has a polyfill: the receiver `Promise` gets
// rewritten to an object literal with only polyfill ids, so no `_Promise` import
// is injected (leaking an unused `_Promise` would bloat the bundle).
// Two shapes covered: IIFE argument and default parameter.
(({ resolve }) => resolve)(Promise);
function fn({ resolve, reject } = Promise) { return [resolve, reject]; }
