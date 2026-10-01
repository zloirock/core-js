import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set";
// An imported key is not proven safe to mirror. The declaration retains its key read
// and guards the named static against the selected constructor.
import X from "x";
const cond = Math.random() > 0.5;
const _ref = cond ? Array : _Set,
  {
    [X]: it
  } = _ref,
  from = _ref === Array ? _Array$from : _ref.from;
[from([1]), it];