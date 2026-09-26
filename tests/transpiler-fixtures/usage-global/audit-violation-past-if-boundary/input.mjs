// shadow-binding violation past an `if` boundary: outer references after the block
// must still see the original global binding, not the inner shadow.
let x = [1, 2, 3];
if (Math.random()) {
  x = 'hello';
}
x.at(0);
