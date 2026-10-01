// A nested plain block assigns before the following read in its branch.
// The sibling branch need not exit for that local assignment to dominate the read.
export function read(flag) {
  let value = 'abc';
  if (flag) { { value = [1, 2]; } return value.at(0); }
}
