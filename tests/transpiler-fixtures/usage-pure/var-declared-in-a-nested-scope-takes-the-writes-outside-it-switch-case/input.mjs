// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  switch (c) {
    case 1:
      var e = [1];
      w();
      use(e.keys());
  }
  function w() { e = new Map(); }
}
