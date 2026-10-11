import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a branch that throws only after a conditional `break` out of it - to a label inside it or around
// the `if` - does not exit on every path, so the write in the other branch does not dominate the
// read and the receiver keeps the initial array too. a `break` a loop inside the branch captures
// leaves it exiting: the receiver is the string, which needs no `slice`. distinct method per line
export function a(c, d) {
  let v = [1];
  if (d) v = 'abc';else {
    l: {
      if (c) break l;
      throw 0;
    }
  }
  return v.at(-1);
}
export function b(c, d) {
  let v = [1];
  l: if (d) v = 'abc';else {
    if (c) break l;
    throw 0;
  }
  return v.includes(1);
}
export function c(k, d) {
  let v = [1];
  if (d) v = 'abc';else {
    while (k) if (k()) break;
    throw 0;
  }
  return v.slice(1);
}