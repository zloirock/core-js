// A retained source prefix runs while the extracted binding is still uninitialized.
let seen;
function observe() {
  try { seen = typeof isInteger; } catch (error) { seen = error.name; }
}
const { Number: { isInteger, ...numbers }, WeakMap: W } = (observe(), globalThis);
use(seen, isInteger, numbers, W);
