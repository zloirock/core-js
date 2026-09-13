// An unknown local receiver's Array property does not identify the global constructor.
// Keep both optional checks and the method receiver, with no polyfill imports.
export function custom(value) {
  return value?.Array?.of(3);
}