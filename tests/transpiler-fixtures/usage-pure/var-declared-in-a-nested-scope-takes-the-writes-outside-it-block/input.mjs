// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  {
    var b = 'abc';
    w();
    use(b.includes('a'));
  }
  function w() { b = [1]; }
}
