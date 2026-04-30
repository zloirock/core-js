// SE prefix on the extracted declarator (`(logCall(), globalThis)`) PLUS sibling block-body
// IIFE with instance method. SE prefix gets lifted to standalone statement; sibling's
// `var _ref;` consumed via the new defer path. exercises both code-paths in single
// fixture - SE prefix lift logic and ref-binding consumption don't conflict
declare function logCall(): void;
const { Array: { from } } = (logCall(), globalThis), kls = (() => {
  return [].values();
})();
export { from, kls };
