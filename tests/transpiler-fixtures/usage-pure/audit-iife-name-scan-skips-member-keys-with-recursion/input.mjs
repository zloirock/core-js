const withRecursion = (function r({ groupBy, ...rest } = Object) {
  return globalThis.never ? r({ groupBy: null }) : [groupBy, rest];
})();
export { withRecursion };
