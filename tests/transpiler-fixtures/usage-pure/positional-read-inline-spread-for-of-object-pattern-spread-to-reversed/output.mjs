import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
for (const {
  x: viaMemberCommon
} of [...[{
  x: [1]
}], {
  x: [2]
}]) _toReversedMaybeArray(viaMemberCommon).call(viaMemberCommon);