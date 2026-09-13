// A preceding unconditional assignment supplies the string at the read.
// A write in the opposite arm cannot invalidate that assignment.
export function read(flag) {
  let value = 0;
  value = 'abc';
  if (flag) value = [1, 2];
  else return value.at(0);
}
