// a computed key that folds to no name at all cannot be replayed without re-running it, so the
// whole pattern takes the body fallback - the one emission left that ignores what the caller passed
const dynamicComputedKey = (function ({ [globalThis.pick]: picked, assign } = Object) {
  return [picked, assign];
})();
export { dynamicComputedKey };
