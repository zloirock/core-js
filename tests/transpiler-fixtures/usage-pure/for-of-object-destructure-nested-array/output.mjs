import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
for (const {
  items
} of [{
  items: [1, 2, 3]
}]) {
  _atMaybeArray(items).call(items, -1);
}