import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// the re-key must not depend on WHICH sibling dispatched the flatten (the key visitor may
// or may not have fired on the original before the residual is cloned / sliced), nor on the
// host kind - an assignment host re-keys the same way
const _ref = {
  Object: {
    fromEntries: _Object$fromEntries
  },
  Map: _Map
};
const {
  Object: {
    fromEntries: fe5
  }
} = _ref;
const e = _getIteratorMethod(_ref.Map);
e;