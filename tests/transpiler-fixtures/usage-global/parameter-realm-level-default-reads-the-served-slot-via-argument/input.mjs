export const viaArgument = (function ({ Promise: { reject } = Reflect }) {
  return reject;
})(globalThis);
