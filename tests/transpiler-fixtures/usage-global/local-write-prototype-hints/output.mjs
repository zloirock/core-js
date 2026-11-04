import "core-js/modules/es.array.at";
// An installed array prototype contributes an array family even without a scalar type.
export function read(write) {
  let value = ["z"];
  if (write) value = Object.create(Array.prototype);
  return value.at(0);
}