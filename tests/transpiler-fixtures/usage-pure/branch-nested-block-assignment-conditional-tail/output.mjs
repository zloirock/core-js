import _includes from "@core-js/pure/actual/instance/includes";
// A later conditional write may replace the array from the nested block with a string.
// The read must retain both receiver families.
export function read(flag, overwrite) {
  let value = 'before';
  if (flag) {
    {
      value = [1, 2];
    }
    if (overwrite) value = 'abc';
    return _includes(value).call(value, 'ab');
  }
}