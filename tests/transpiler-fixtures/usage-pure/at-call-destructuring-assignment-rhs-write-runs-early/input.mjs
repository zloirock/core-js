// The method call precedes this destructuring assignment and sees the original array.
const o = { f: [1, 2], m() { return this.f.at(0); } };
o.m();
let q;
[q] = [o.f = 'str'];
export { q };

// This default runs after the RHS has replaced the stored array with a string.
export function duringAssignment() {
  const box = { f: [7], m() { return this.f.at(0); } };
  let result;
  [result = box.m()] = (box.f = 'str', []);
  return result;
}
