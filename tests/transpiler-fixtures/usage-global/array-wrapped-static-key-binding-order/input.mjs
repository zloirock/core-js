// A computed key under an array wrapper observes its binding before initialization.
// The static method is polyfilled after that key; the second element stays paired.
let seen;
function observe() {
  try { seen = typeof from; } catch (error) { seen = error.name; }
}
const [{ [(observe(), 'from')]: from }, other] = [Array, {}];
export const result = [seen, from([7]), other];
