let k = 0;
// a user-written sequence stays put - only plugin-built wrappers lift into the guard
export function readName(x) {
  return (k++, x).name;
}
