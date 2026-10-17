// BOUNDARY: the callee is declared above the chain, so its global sits outside the guard's span
const above = () => globalThis;
export const declaredCallee = above()?.window?.Reflect.ownKeys({ c: 3 }).flatMap(key => [key]);
