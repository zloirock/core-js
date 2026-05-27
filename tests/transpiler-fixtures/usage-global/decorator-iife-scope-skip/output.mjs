import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
// IIFE inside the decorator expression hides its `Map` reference behind a function scope; the
// decorator itself still triggers the metadata polyfills required by stage-3 decorator support
@(function () {
  const Map = MyMap;
  return Map;
}())
class Foo {}