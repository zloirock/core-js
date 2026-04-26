// catch parameter shadows the `Map` global: the inner `Map.groupBy(...)` resolves to
// the local binding and is not polyfilled.
try {} catch (Map) {
  Map.groupBy([], x => x);
}