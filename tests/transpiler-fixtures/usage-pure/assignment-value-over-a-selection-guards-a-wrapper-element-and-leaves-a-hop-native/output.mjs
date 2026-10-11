import _Array$from from "@core-js/pure/actual/array/from";
// an assignment whose value is read, over a selection of a constructor and a user object: the static off an
// array wrapper's element takes the identity guard over the captured element, while the same static off an
// object hop's slot stays native, unserved on an engine that lacks it
let pick = 1;
const userObj = {};
{
  var _ref, _ref2;
  const host = ([_ref] = _ref2 = [pick ? Array : userObj], f = _ref === Array ? _Array$from : _ref.from, _ref2);
}
{
  const host = {
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj
  };
}