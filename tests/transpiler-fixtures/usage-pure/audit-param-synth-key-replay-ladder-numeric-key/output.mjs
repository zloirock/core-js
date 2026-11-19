import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
const numericKey = function ({
  0: zero,
  getOwnPropertyDescriptor
} = (Object, {
  get "0"() {
    return Object["0"];
  },
  getOwnPropertyDescriptor: _Object$getOwnPropertyDescriptor
})) {
  return [zero, getOwnPropertyDescriptor];
}();
export { numericKey };