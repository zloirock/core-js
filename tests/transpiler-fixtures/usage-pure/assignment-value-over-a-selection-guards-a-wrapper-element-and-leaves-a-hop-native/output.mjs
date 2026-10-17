import _Array$from from "@core-js/pure/actual/array/from";
// The local truthy selector decides the Array arm. Both assignment expressions still evaluate and
// return their original RHS containers, while each `from` binding uses the Array static directly.
// `mixed-static-instance-selection` covers the live identity guard; `destructure-assignment-retains-result`
// covers an assignment pattern whose value is observed.
let pick = 1;
const userObj = {};
{
  var _ref;
  const host = ([{}] = _ref = [pick ? Array : userObj], f = _Array$from, _ref);
}
{
  var _ref2;
  const host = (_ref2 = {
    w: {}
  } = {
    w: pick ? Array : userObj
  }, f = _Array$from, _ref2);
}