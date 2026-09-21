import _Promise from "@core-js/pure/actual/promise";
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
function effect() {
  return 0;
}
function withDefault({
  allSettled,
  ...promiseRest
} = (effect(), _Promise)) {
  return allSettled([]);
}
withDefault();