import "core-js/modules/es.symbol.async-dispose";
import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.array.at";
import "core-js/modules/es.iterator.dispose";
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