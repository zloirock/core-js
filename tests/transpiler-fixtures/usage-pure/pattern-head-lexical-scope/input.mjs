export function read() {
  const rows = [3];
  let captured;
  for (const { at: rows, n = 8 } of (captured = () => rows, [[1]])) {
    const n = 99;
    try { captured(); } catch (error) { return [rows.call([5], 0), n, error.name]; }
  }
}
