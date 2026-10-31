// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  while (c) {
    var a = 'abc';
    w();
    use(a.at(-1));
  }
  function w() { a = [1]; }
}
