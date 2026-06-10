import _Array$from from "@core-js/pure/actual/array/from";
// `&&` yields its RIGHT side when taken: only the right operand is replaced by the mirrored
// literal - a falsy left keeps selecting natively (and an effectful left keeps running in place)
let m = 1;
let c = 0;
function f({
  Array: {
    from
  }
} = (c++, m) && {
  Array: {
    from: _Array$from
  }
}) {
  return [from, c];
}
export { f };