// multi-decl flatten + sibling IIFE with static call (no _ref needed). asserts the issue
// is specifically the var _ref insert vs full-declaration overwrite collision and not
// any inner transform inside sibling
const { Array: { from } } = globalThis, kls = (() => {
  return Object.values({ a: 1 });
})();
export { from, kls };
