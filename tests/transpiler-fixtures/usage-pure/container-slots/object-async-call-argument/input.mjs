// An async callee receives the container and can replace its constructor slot before the read.
const escapedByAsyncCallee = (function () {
  const asyncEscape = { k: Object };
  async function takeAsync(t) { t.k = Map; }
  void takeAsync(asyncEscape);
  const { k: { keys } } = asyncEscape;
  return keys;
})();
export { escapedByAsyncCallee };
