// A user consumer does not own the throwing read of its effectful realm argument.
const effects = [];
export function read() {
  return (x => globalThis)(Number.parseFloat("1.5")).window.Set.prototype.has.call(new Set([1]), 1);
}
