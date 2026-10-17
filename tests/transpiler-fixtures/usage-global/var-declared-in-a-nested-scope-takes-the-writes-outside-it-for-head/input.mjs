// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  for (var h = [1]; c; ) {
    w();
    use(h.entries());
  }
  function w() { h = new Set(); }
}
