import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A nested effectful key runs once before the served from binding.
// The independent flat call keeps its own array helper.
{
  var _ref;
  const {
      x: {}
    } = {
      x: Array
    },
    f2 = (effectful(), _Array$from);
  const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
}