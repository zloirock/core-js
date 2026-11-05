// An effectful computed key observes its static binding before initialization.
// The capture serves from only after that key and preserves the second element.
let seen;
function observe() {
  try { seen = typeof from; } catch (error) { seen = error.name; }
}
const [{ [(observe(), 'from')]: from }, other] = [Array, {}];
export const result = [seen, from([7]), other];
