// IIFE whose callee is an arrow function wrapped in a TS `as any` cast:
// `((() => { x = 'hello' }) as any)()`. The IIFE assigns a string literal to `x`,
// so after the call site `x.at(-1)` is known to be a string and only
// `es.string.at` should be emitted - not the cross-type Array+String fallback.
// Exercises that TS cast wrappers around the callee don't disguise the IIFE.
let x = [];
((() => {
  // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
  x = 'hello';
}) as any)();
x.at(-1);
