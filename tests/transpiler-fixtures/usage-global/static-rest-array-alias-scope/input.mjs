// The element was captured before the alias changed and outside the parameter shadow.
let A = Array;
const source = [A];
A = { from: () => 9 };
function read(A) {
  const [{ from, ...rest }] = source;
  return from([1]);
}
export const result = read(A);
