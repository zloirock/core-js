import _Array$from from "@core-js/pure/actual/array/from";
// a PURE `&&`-guarded declarator init must NOT flatten: the guard can select its falsy left,
// and that path's native TypeError must survive - the mirror swaps only the right operand,
// keeping the selection (and the throw) native
let m = 1;
const {
  Array: {
    from
  }
} = m && {
  Array: {
    from: _Array$from
  }
};
from([1]);