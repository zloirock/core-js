// a global-ctor alias bound with `let` (or in a for-init) must re-polyfill member reads exactly like a
// `const` alias: `P.allSettled` resolves to the pure static, `new P` binds the pure ctor. the alias
// binding is identified by its init resolving to the destructured global, not by declaration kind - a
// const-only shadow gate left every `let` / for-init alias raw -> TypeError on ie:11
let { Promise: P } = globalThis;
const settled = P.allSettled([]);
const pending = new P(resolve => resolve());
for (let { Array: A } = globalThis; flag; flag = false) use(A.of(1, 2));
export { settled, pending };
