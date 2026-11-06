// A synthesized parameter default retains its nested at claim on every defaulted call.
// A supplied argument skips that default and keeps its own methods and length.
const log = [];
function read({ of, length } = (() => (log.push([7].at(0)), globalThis))().Array) {
  return [of(3), length];
}
export const results = [read(), read(), read({ of: n => [n + 1], length: 9 })];
export { log };
