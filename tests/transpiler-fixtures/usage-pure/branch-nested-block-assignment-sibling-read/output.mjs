import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A write in the exiting branch cannot reach a read in its sibling branch.
// Only the original string reaches the read; Array#at is not needed.
export function read(flag) {
  let value = 'abc';
  if (flag) {
    {
      value = [1, 2];
    }
    throw 0;
  } else return _atMaybeString(value).call(value, 0);
}