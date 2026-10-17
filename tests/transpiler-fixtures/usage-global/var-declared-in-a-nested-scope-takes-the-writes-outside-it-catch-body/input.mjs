// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  try { g(); } catch {
    var d = [1];
    w();
    use(d.values());
  }
  function w() { d = new Set(); }
}
