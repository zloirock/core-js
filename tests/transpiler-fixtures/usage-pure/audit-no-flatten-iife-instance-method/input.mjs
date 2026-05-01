// IIFE returning instance method polyfill at top level - control case where no destructure
// flatten queues a full-declaration overwrite. asserts var _ref insert flushes cleanly when
// no outer overwrite covers the IIFE body
const kls = (() => {
  return [].values();
})();
export { kls };
