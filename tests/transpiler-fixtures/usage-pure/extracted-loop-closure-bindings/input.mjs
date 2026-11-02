// Both extracted and residual locals retain their per-iteration closure.
export function register(rows, handlers) {
  for (const row of rows) {
    const { name, find } = row;
    handlers[name] = () => find();
  }
}
