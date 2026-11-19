// The keyed read runs once before the default and the next property.
// An anonymous default retains the name of its source binding.
export function read(factory, key) {
  const { [(key(), 'at')]: method = function () {}, after } = factory();
  return [method.name, after];
}
