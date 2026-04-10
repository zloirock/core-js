import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
for (const {
  name
} of [{
  name: [1, 2, 3]
}]) {
  _atMaybeArray(name).call(name, -1);
}