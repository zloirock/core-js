// Nested labels around an early-return guard preserve its narrowing for the next
// statement. The method read after the guard needs only the Array implementation.
declare const x: string | string[];
function fn() {
  outer: inner: if (!Array.isArray(x)) return;
  x.at(0);
}
fn();
