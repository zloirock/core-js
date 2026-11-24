// The outer iterator read is enabled. Its nested name property stays native.
const { [Symbol.iterator]: {
  // core-js-disable-next-line
  name: result,
} } = [1];
export { result };
