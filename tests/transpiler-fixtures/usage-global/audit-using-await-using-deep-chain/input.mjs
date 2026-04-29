// deep mix of `using` and `await using` declarations across nested scopes plus a
// downstream polyfillable `.at(-1)` call. Both Symbol.dispose / Symbol.asyncDispose
// polyfills must land alongside Array.prototype.at, with no duplicate scaffolding
async function main() {
  using outerSync = getSync();
  await using outerAsync = getAsync();
  {
    using innerSync = getSync();
    await using innerAsync = getAsync();
    return [outerSync, outerAsync, innerSync, innerAsync].at(-1);
  }
}
